import { headers } from "next/headers";
import { Clock, Images, ThumbsUp } from "lucide-react";
import { exigirSessao } from "@/lib/dal";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";
import { listarFotosPainel } from "@/lib/db/queries/galeria";
import { gerarQrSvg } from "@/lib/qr";
import { CartaoEstatistica } from "@/components/painel/CartaoEstatistica";
import { ConfiguracaoGaleria } from "@/components/painel/ConfiguracaoGaleria";
import { GradeFotosPainel } from "@/components/painel/GradeFotosPainel";

export default async function PaginaGaleria() {
  const usuario = await exigirSessao();
  const [casamento, fotos, cabecalhos] = await Promise.all([
    buscarCasamentoPorId(usuario.casamentoId),
    listarFotosPainel(usuario.casamentoId),
    headers(),
  ]);
  if (!casamento) {
    return <p className="text-muted-foreground">Casamento não encontrado.</p>;
  }

  let qrSvg: string | null = null;
  if (casamento.galeria_token) {
    const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host");
    const protocolo =
      cabecalhos.get("x-forwarded-proto") ??
      (host?.startsWith("localhost") ? "http" : "https");
    qrSvg = await gerarQrSvg(
      `${protocolo}://${host}/${casamento.slug}/galeria/${casamento.galeria_token}`
    );
  }

  const pendentes = fotos.filter((f) => f.status === "pendente").length;
  const autores = new Set(fotos.map((f) => f.nome_autor.toLowerCase())).size;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-foreground">
          Galeria colaborativa
        </h1>
        <p className="mt-2 text-muted-foreground">
          As fotos dos convidados, todas num só lugar. Eles enviam pelo
          celular, e vocês decidem o que fica visível.
        </p>
      </header>

      <section aria-label="Resumo" className="grid grid-cols-3 gap-4">
        <CartaoEstatistica
          rotulo="Fotos recebidas"
          valor={fotos.length}
          icone={Images}
          cor="bg-accent/10 text-accent"
        />
        <CartaoEstatistica
          rotulo="Aguardando aprovação"
          valor={pendentes}
          icone={Clock}
          cor="bg-sol/15 text-[#8a6a1f]"
        />
        <CartaoEstatistica
          rotulo="Pessoas enviaram"
          valor={autores}
          icone={ThumbsUp}
          cor="bg-verde/10 text-verde"
        />
      </section>

      <ConfiguracaoGaleria
        slug={casamento.slug}
        token={casamento.galeria_token}
        moderada={casamento.galeria_moderada}
        qrSvg={qrSvg}
      />

      {(casamento.galeria_token || fotos.length > 0) && (
        <GradeFotosPainel fotos={fotos} />
      )}
    </div>
  );
}
