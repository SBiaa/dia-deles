const DIA_MS = 24 * 60 * 60 * 1000;

/** Data de hoje (YYYY-MM-DD), no fuso do servidor. */
export function hojeIso(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function paraUtc(iso: string): number {
  return Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
}

/** Diferença em dias inteiros: positivo quando `alvo` é depois de `base`. */
export function diasEntre(base: string, alvo: string): number {
  return Math.round((paraUtc(alvo) - paraUtc(base)) / DIA_MS);
}

export function somarDias(iso: string, dias: number): string {
  return new Date(paraUtc(iso) + dias * DIA_MS).toISOString().slice(0, 10);
}

/** Soma meses mantendo o dia (ou o último dia do mês, se não existir). */
export function somarMeses(iso: string, meses: number): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  const alvo = new Date(Date.UTC(ano, mes - 1 + meses, 1));
  const ultimo = new Date(
    Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)
  ).getUTCDate();
  alvo.setUTCDate(Math.min(dia, ultimo));
  return alvo.toISOString().slice(0, 10);
}
