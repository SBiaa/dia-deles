import type { ConvidadoRow } from "@/lib/db/queries/convidados";

export function calcularResumoConvidados(convidados: ConvidadoRow[]) {
  const confirmados = convidados.filter((c) => c.confirmado === true);
  const recusados = convidados.filter((c) => c.confirmado === false);
  const pendentes = convidados.filter((c) => c.confirmado === null);
  const totalPessoas = confirmados.reduce(
    (soma, c) => soma + 1 + c.numero_acompanhantes,
    0
  );

  return {
    confirmados: confirmados.length,
    recusados: recusados.length,
    pendentes: pendentes.length,
    totalPessoas,
  };
}
