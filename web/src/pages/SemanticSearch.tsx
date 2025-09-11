import React, { useState } from "react";
import { aiSearch } from "../api";
const SemanticSearch: React.FC = () => {
  const [q,setQ] = useState(""); const [ans,setAns]=useState<any>(null);
  const go = async()=> setAns(await aiSearch(q));
  return (<section>
    <h2>Semantic Search</h2>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask about EGFR..." />
    <button onClick={go}>Search</button>
    {ans && <pre>{JSON.stringify(ans,null,2)}</pre>}
  </section>);
};
export default SemanticSearch;
