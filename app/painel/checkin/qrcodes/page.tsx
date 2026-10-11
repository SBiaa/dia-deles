import { headers } from "next/headers";
import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { listarConvidadosComMesa } from "@/lib/db/queries/convidados";
import { pessoasEsperadas } from "@/lib/checkin";
import { gerarQrSvg } from "@/lib/qr";
import { ImprimirBotao } from "@/components/publico/ImprimirBotao";

export const metadata = { title: "QR codes dos convidados" };

export default async function PaginaQrCodes() {
  const usuario = await exigirSessao();
  const [casamento, convidados, cabecalhos] = await Promise.all([
    buscarCasamentoPorId(usuario.casamentoId),
    listarConvidadosComMesa(usuario.casamentoId),
    headers(),
  ]);
  if (!casamento) return null;

  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host");
  const protocolo =
    cabecalhos.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const origem = `${protocolo}://${host}`;

  const confirmados = convidados.filter((c) => c.confirmado === true);
  const cartoes = await Promise.all(
    confirmados.map(async (c) => ({
      c,
      svg: await gerarQrSvg(`${origem}/${casamento.slug}/convite/${c.codigo}`),
    }))
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <h1 className="font-serif text-3xl text-foreground">
            QR codes dos convidados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cartoes.length} convidados confirmados. Imprima para a recepção ou
            para os cartões de mesa.
          </p>
        </div>
        <ImprimirBotao />
      </header>

      {cartoes.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Ainda não há convidados confirmados.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3 print:gap-3">
          {cartoes.map(({ c, svg }) => (
            <li
              key={c.id}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center print:break-inside-avoid"
            >
              <div
                className="size-36 [&>svg]:size-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <p className="mt-3 font-serif text-lg leading-tight text-foreground">
                {c.nome}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pessoasEsperadas(c)}{" "}
                {pessoasEsperadas(c) === 1 ? "pessoa" : "pessoas"}
                {c.mesa_nome ? ` · ${c.mesa_nome}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
