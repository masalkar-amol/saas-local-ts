import React, { useEffect, useState } from "react";
import { getBiomarkers, Biomarker } from "../api";
const Biomarkers: React.FC = () => {
  const [list, setList] = useState<Biomarker[]>([]);
  useEffect(()=>{ getBiomarkers().then(setList).catch(console.error); },[]);
  return (<section>
    <h2>Biomarkers</h2>
    <ul>{list.map(b => <li key={b.id}>{b.code} — {b.name} ({b.assay_type})</li>)}</ul>
  </section>);
};
export default Biomarkers;
