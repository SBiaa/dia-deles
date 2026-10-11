import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import {
  buscarCasamentoPorGaleriaToken,
  criarFoto,
} from "@/lib/db/queries/galeria";

const esquema = z.object({
  url: z.url(),
  nome: z.string().trim().min(1).max(60),
});

/** Registra uma foto já enviada ao Blob, entrando em moderação se ativa. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const casamento = await buscarCasamentoPorGaleriaToken(token);
  if (!casamento) {
    return NextResponse.json({ erro: "Galeria indisponível." }, { status: 404 });
  }

  const corpo = esquema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json(
      { erro: "Informe seu nome e envie uma foto válida." },
      { status: 400 }
    );
  }

  // Só aceita arquivos que estejam no armazenamento do próprio app.
  const host = new URL(corpo.data.url).hostname;
  if (!host.endsWith(".blob.vercel-storage.com")) {
    return NextResponse.json({ erro: "Arquivo inválido." }, { status: 400 });
  }

  const foto = await criarFoto({
    casamentoId: casamento.id,
    url: corpo.data.url,
    nomeAutor: corpo.data.nome,
    status: casamento.galeria_moderada ? "pendente" : "aprovada",
  });

  revalidatePath("/painel/galeria");
  return NextResponse.json({ ok: true, status: foto.status });
}
