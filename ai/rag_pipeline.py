import os, faiss, numpy as np
from typing import List, Tuple
from sentence_transformers import SentenceTransformer

EMBED_MODEL = os.getenv("EMBED_MODEL","sentence-transformers/all-MiniLM-L6-v2")
INDEX_PATH  = os.getenv("FAISS_INDEX_PATH","/data/faiss.index")
MODEL = SentenceTransformer(EMBED_MODEL)

def build_or_load(corpus: List[str]) -> Tuple[faiss.IndexFlatIP, np.ndarray]:
    dim = MODEL.get_sentence_embedding_dimension()
    index = faiss.IndexFlatIP(dim)
    if corpus:
        embs = MODEL.encode(corpus, normalize_embeddings=True)
        index.add(embs.astype("float32"))
        return index, np.array(corpus, dtype=object)
    # empty index
    return index, np.array([], dtype=object)

def search(index, corpus, q: str, k: int = 5) -> List[str]:
    qv = MODEL.encode([q], normalize_embeddings=True).astype("float32")
    D, I = index.search(qv, k)
    return [str(corpus[i]) for i in I[0] if i != -1]
