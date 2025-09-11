import duckdb, pyarrow as pa, pyarrow.parquet as pq
import os, random

# create a tiny parquet if not present
p = "data/samples/assays.parquet"
if not os.path.exists(p):
    import pandas as pd
    df = pd.DataFrame({
        "assay_type": ["DNA","RNA","Protein","DNA","RNA","DNA"],
        "measurement": [1.2,3.4,2.1,1.3,3.5,1.25]
    })
    table = pa.Table.from_pandas(df); pq.write_table(table, p)

tbl = pq.read_table(p)
con = duckdb.connect()
con.register("tbl", tbl)
df = con.execute("""
  SELECT assay_type, COUNT(*) AS n, AVG(measurement) AS avg_m
  FROM tbl GROUP BY assay_type ORDER BY n DESC
""").df()
out = "data/samples/assay_stats.parquet"
pq.write_table(pa.Table.from_pandas(df), out)
print(df)
