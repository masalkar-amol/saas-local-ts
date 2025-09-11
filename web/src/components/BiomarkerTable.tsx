import React from "react";
import { Biomarker } from "@/api";

export default function BiomarkerTable({ rows }: { rows: (Biomarker & {_ai_score?: number})[] }) {
  return (
    <table className="table-auto w-full border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1 text-left">Code</th>
          <th className="border px-2 py-1 text-left">Name</th>
          <th className="border px-2 py-1 text-left">Assay</th>
          <th className="border px-2 py-1 text-left">AI score</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id ?? `${r.code}-${r.name}`}>
            <td className="border px-2 py-1">{r.code}</td>
            <td className="border px-2 py-1">{r.name}</td>
            <td className="border px-2 py-1">{r.assay_type}</td>
            <td className="border px-2 py-1">
              {typeof r._ai_score === "number" ? r._ai_score.toFixed(3) : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
