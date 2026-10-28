import "server-only";
import { pool } from "./db/pool";

/** IP do cliente. Na Vercel, x-forwarded-for é sobrescrito pela plataforma. */
export function ipDe(headers: Headers): string {
  const encaminhado = headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for");
  return (
    encaminhado?.split(",")[0]?.trim() || headers.get("x-real-ip") || "desconhecido"
  );
}

/**
 * Conta uma tentativa para `chave` numa janela fixa de `janelaSegundos`.
 * Retorna true se ainda está dentro do limite. Se o banco falhar, libera
 * (melhor que derrubar o site por causa do limitador).
 */
export async function dentroDoLimite(
  chave: string,
  max: number,
  janelaSegundos: number
): Promise<boolean> {
  try {
    const { rows } = await pool.query<{ total: number }>(
      `insert into limite_taxa (chave, janela)
       values ($1, to_timestamp(floor(extract(epoch from now()) / $2::int) * $2::int))
       on conflict (chave, janela) do update set total = limite_taxa.total + 1
       returning total`,
      [chave, janelaSegundos]
    );
    if (Math.random() < 0.02) {
      await pool.query(
        "delete from limite_taxa where janela < now() - interval '1 day'"
      );
    }
    return (rows[0]?.total ?? 1) <= max;
  } catch {
    return true;
  }
}
