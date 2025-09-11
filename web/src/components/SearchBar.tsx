// src/components/SearchBar.tsx
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search…", autoFocus = true }: Props) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  return (
    <div className="searchbar">
      <input
        ref={ref}
        className="searchbar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => (e.key === "Enter" ? onSubmit?.() : undefined)}
      />
      <button className="btn" onClick={onSubmit}>Search</button>
    </div>
  );
}
