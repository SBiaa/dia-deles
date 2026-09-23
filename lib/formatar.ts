export function formatarPreco(centavos: number | null): string | null {
  if (centavos === null) return null;
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
