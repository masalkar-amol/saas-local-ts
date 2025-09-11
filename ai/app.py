import os
import asyncio
from typing import List, Dict, Any

import httpx
import numpy as np
import faiss

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

API_BASE = os.getenv("API_BASE", "http://api:8000")
MODEL_NAME = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
TOP_K = int(os.getenv("TOP_K", "10"))

app = FastAPI(title="AI Service (Semantic Search)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400,
)

# ---- Globals ----
model: SentenceTransformer | None = None
faiss_index: faiss.IndexFlatIP | None = None
# Store vectors normalized for cosine via inner product
id_to_doc: Dict[int, Dict[str, Any]] = {}
id_list: List[int] = []
dim: int | None = None
index_ready = asyncio.Event()

def _normalize(mat: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(mat, axis=1, keepdims=True) + 1e-12
    return mat / norms

async def _fetch_all_biomarkers() -> List[Dict[str, Any]]:
    # Pull all rows (adjust if you paginate on API side)
    url = f"{API_BASE}/api/biomarkers/"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()
    if isinstance(data, dict) and "results" in data:
        return data["results"]
    return data  # plain list

def _to_corpus_text(doc: Dict[str, Any]) -> str:
    # Create a searchable text representation
    code = doc.get("code", "")
    name = doc.get("name", "")
    assay = doc.get("assay_type", "")
    attrs = doc.get("attributes", {})
    attrs_txt = " ".join([f"{k}:{v}" for k, v in attrs.items()])
    return f"{code} {name} {assay} {attrs_txt}".strip()

async def _build_index(docs: List[Dict[str, Any]]):
    global model, faiss_index, id_to_doc, id_list, dim

    if model is None:
        # load on first build
        model = SentenceTransformer(MODEL_NAME)

    texts = [_to_corpus_text(d) for d in docs]
    if not texts:
        # empty index
        id_to_doc = {}
        id_list = []
        faiss_index = faiss.IndexFlatIP(384)  # MiniLM-L6 = 384 dims
        dim = 384
        return

    # encode
    emb = model.encode(texts, batch_size=64, convert_to_numpy=True, show_progress_bar=False)
    emb = _normalize(emb)
    dim = emb.shape[1]

    # faiss ip (cosine via normalized vectors)
    index = faiss.IndexFlatIP(dim)
    index.add(emb)

    # id mapping
    id_to_doc = {i: docs[i] for i in range(len(docs))}
    id_list = list(range(len(docs)))
    return index

@app.on_event("startup")
async def on_startup():
    # Build index in background so health becomes ready quickly
    async def _bg():
        try:
            docs = await _fetch_all_biomarkers()
            index = await _build_index(docs)
            if index is not None:
                global faiss_index
                faiss_index = index
        finally:
            index_ready.set()
    asyncio.create_task(_bg())

@app.get("/health")
async def health():
    return {"ok": True, "indexed": index_ready.is_set(), "count": len(id_list)}

class SearchIn(BaseModel):
    q: str | None = None
    limit: int | None = TOP_K

def _search_embeddings(query: str, limit: int) -> List[Dict[str, Any]]:
    assert faiss_index is not None and model is not None and dim is not None
    q_emb = model.encode([query], convert_to_numpy=True)
    q_emb = _normalize(q_emb.astype(np.float32))
    scores, idxs = faiss_index.search(q_emb, k=min(limit, len(id_list)))
    idxs = idxs[0]
    scores = scores[0]
    out = []
    for i, s in zip(idxs, scores):
        if i == -1:  # no result
            continue
        doc = id_to_doc.get(i)
        if not doc:
            continue
        # include score for UI
        enriched = dict(doc)
        enriched["_ai_score"] = float(s)
        out.append(enriched)
    return out

@app.get("/search")
async def ai_search_get(q: str | None = Query(None), limit: int = Query(TOP_K)):
    await index_ready.wait()
    if not q or not q.strip():
        return []
    if faiss_index is None:
        raise HTTPException(status_code=503, detail="Index not ready")
    return _search_embeddings(q.strip(), limit)

@app.post("/search")
async def ai_search_post(payload: SearchIn):
    await index_ready.wait()
    q = (payload.q or "").strip()
    limit = payload.limit or TOP_K
    if not q:
        return []
    if faiss_index is None:
        raise HTTPException(status_code=503, detail="Index not ready")
    return _search_embeddings(q, limit)

@app.post("/reindex")
async def reindex():
    # manual rebuild if data changed
    docs = await _fetch_all_biomarkers()
    index = await _build_index(docs)
    if index is not None:
        global faiss_index
        faiss_index = index
    return {"ok": True, "count": len(id_list)}
