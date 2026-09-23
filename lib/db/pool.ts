import { Pool, types } from "@neondatabase/serverless";

// Mantém date/timestamp/timestamptz como strings (não Date) — bate com os
// tipos das queries (`string | null`) e evita o bug clássico de fuso horário
// de deixar o driver converter "date" pra Date usando o fuso local.
types.setTypeParser(1082, (v) => v); // date
types.setTypeParser(1114, (v) => v); // timestamp
types.setTypeParser(1184, (v) => v); // timestamptz

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL não configurada.");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export const pool_: Pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPool(), prop, receiver);
    return typeof value === "function" ? value.bind(getPool()) : value;
  },
});

export { pool_ as pool };
