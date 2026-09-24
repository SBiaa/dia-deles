import type { CustoRow } from "@/lib/db/queries/custos";

export type StatusCusto = "a_orcar" | "pendente" | "parcial" | "pago";

export function statusCusto(custo: CustoRow): StatusCusto {
  if (custo.valor_centavos === null) return "a_orcar";
  if (custo.valor_pago_centavos <= 0) return "pendente";
  if (custo.valor_pago_centavos >= custo.valor_centavos) return "pago";
  return "parcial";
}

export function calcularResumoCustos(custos: CustoRow[]) {
  let totalPrevistoCentavos = 0;
  let totalPagoCentavos = 0;
  for (const custo of custos) {
    totalPrevistoCentavos += custo.valor_centavos ?? 0;
    totalPagoCentavos += custo.valor_pago_centavos;
  }
  return {
    totalPrevistoCentavos,
    totalPagoCentavos,
    totalFaltaCentavos: Math.max(totalPrevistoCentavos - totalPagoCentavos, 0),
  };
}
