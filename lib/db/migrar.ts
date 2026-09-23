import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dirMigracoes = path.join(__dirname, "migracoes");

config({ path: path.join(__dirname, "..", "..", ".env.local") });

async function main() {
  await pool.query(`
    create table if not exists migracoes_aplicadas (
      nome text primary key,
      aplicada_em timestamptz not null default now()
    )
  `);

  const arquivos = fs
    .readdirSync(dirMigracoes)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const arquivo of arquivos) {
    const { rows } = await pool.query(
      "select 1 from migracoes_aplicadas where nome = $1",
      [arquivo]
    );
    if (rows.length > 0) {
      console.log(`skip  ${arquivo}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dirMigracoes, arquivo), "utf-8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into migracoes_aplicadas (nome) values ($1)",
        [arquivo]
      );
      await client.query("commit");
      console.log(`ok    ${arquivo}`);
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
