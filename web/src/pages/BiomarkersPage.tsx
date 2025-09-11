import { useEffect, useState } from "react";
import { searchBiomarkers, aiSearch, Biomarker, config } from "@/api";
import { useDebounce } from "@/hooks/useDebounce";
import SearchBar from "@/components/SearchBar";
import BiomarkerTable from "@/components/BiomarkerTable";
import ModeToggle from "@/components/ModeToggle";

type Mode = "regular" | "ai";

export default function BiomarkersPage() {
  const [mode, setMode] = useState<Mode>("regular");
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const [rows, setRows] = useState<Biomarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data =
          mode === "ai"
            ? await aiSearch(dq)
            : (await searchBiomarkers(dq)).rows;
        if (!cancelled) setRows(data ?? []);
      } catch (e: any) {
        if (!cancelled) setErr(e.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dq, mode]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-xl font-bold">Biomarkers</h1>
        <ModeToggle mode={mode} setMode={setMode} />
      </div>

      <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>
        API: {config.API_BASE} {mode === "ai" ? `(AI: ${config.AI_BASE})` : ""}
      </div>

      <SearchBar value={q} onChange={setQ} />

      <div className="status" style={{ margin: "8px 0" }}>
        {loading && <span>Loading…</span>}
        {err && <span style={{ color: "#f87171" }}>Error: {err}</span>}
        {!loading && !err && <span style={{ color: "#9ca3af" }}>
          Showing {rows.length} result(s) {dq ? `for “${dq}”` : ""} in {mode.toUpperCase()} mode
        </span>}
      </div>

      <BiomarkerTable rows={rows} />
    </div>
  );
}
