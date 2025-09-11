import React from "react";

interface ModeToggleProps {
  mode: "regular" | "ai";
  setMode: (m: "regular" | "ai") => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, setMode }) => (
  <div style={{ display: "inline-flex", border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}>
    <button
      onClick={() => setMode("regular")}
      className={`px-3 py-1 ${mode === "regular" ? "bg-black text-white" : "bg-white"}`}
      aria-pressed={mode === "regular"}
    >
      Regular
    </button>
    <button
      onClick={() => setMode("ai")}
      className={`px-3 py-1 ${mode === "ai" ? "bg-black text-white" : "bg-white"}`}
      aria-pressed={mode === "ai"}
    >
      AI
    </button>
  </div>
);

export default ModeToggle;
