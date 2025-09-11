export interface Biomarker {
  id: number;
  code: string;
  name: string;
  assay_type: string;
  attributes?: Record<string, unknown>;
  created_at: string;
}

export interface Paginated<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

const API_BASE =
  (process.env.WEB_API_URL || process.env.VITE_API_BASE || "http://localhost:9070").replace(/\/+$/, "");
const AI_BASE =
  (process.env.WEB_AI_URL || process.env.VITE_AI_BASE || "http://localhost:8001").replace(/\/+$/, "");

function isPaginated<T>(data: unknown): data is Paginated<T> {
  return !!data && typeof data === "object" && "results" in (data as any);
}

export async function searchBiomarkersRaw(query: string) {
  const url = new URL("/api/biomarkers/", API_BASE);
  if (query?.trim()) url.searchParams.set("search", query.trim());
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  return (await res.json()) as Biomarker[] | Paginated<Biomarker>;
}

export async function searchBiomarkers(query: string): Promise<{ rows: Biomarker[]; count?: number }> {
  const data = await searchBiomarkersRaw(query);
  if (Array.isArray(data)) return { rows: data, count: data.length };
  if (isPaginated<Biomarker>(data)) return { rows: data.results ?? [], count: data.count };
  return { rows: [], count: 0 };
}

export async function aiSearch(query: string) {
  const q = (query || "").trim();
  if (!q) return [];
  // Try GET first
  let res = await fetch(`${AI_BASE}/search?q=${encodeURIComponent(q)}`);
  if (res.status === 422 || res.status === 405) {
    // Fallback to POST { q }
    res = await fetch(`${AI_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q }),
    });
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AI ${res.status} ${res.statusText}: ${body}`);
  }
  return (await res.json()) as Biomarker[]; // expect biomarker-like objects
}

export const config = { API_BASE, AI_BASE };
