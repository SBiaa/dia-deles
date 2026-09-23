import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { esquemaRsvp } from "@/lib/validacao/rsvp";
import {
  criarRsvp,
  contarRsvpsRecentesPorIp,
} from "@/lib/db/queries/rsvp";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";

function obterIp(request: NextRequest): string | null {
  const encaminhado = request.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0]!.trim();
  return null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const validado = esquemaRsvp.safeParse({
    casamentoId: formData.get("casamentoId"),
    nomeConvidado: formData.get("nomeConvidado"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    confirmado: formData.get("confirmado"),
    numeroAcompanhantes: formData.get("numeroAcompanhantes"),
    nomesAcompanhantes: formData.get("nomesAcompanhantes"),
    mensagem: formData.get("mensagem"),
    site: formData.get("site"),
  });

  if (!validado.success) {
    return NextResponse.json(
      { erro: "Confira os campos preenchidos." },
      { status: 400 }
    );
  }

  const dados = validado.data;

  // honeypot: campo invisível que só um bot preencheria
  if (dados.site) {
    return NextResponse.json({ ok: true });
  }

  const casamento = await buscarCasamentoPorId(dados.casamentoId);
  if (!casamento || !casamento.publicado) {
    return NextResponse.json({ erro: "Casamento não encontrado." }, { status: 404 });
  }

  const ip = obterIp(request);
  if (ip) {
    const recentes = await contarRsvpsRecentesPorIp(casamento.id, ip, 10);
    if (recentes >= 5) {
      return NextResponse.json(
        { erro: "Muitas confirmações em pouco tempo. Tente novamente mais tarde." },
        { status: 429 }
      );
    }
  }

  await criarRsvp({
    casamentoId: casamento.id,
    nomeConvidado: dados.nomeConvidado,
    email: dados.email,
    telefone: dados.telefone,
    confirmado: dados.confirmado,
    numeroAcompanhantes: dados.numeroAcompanhantes,
    nomesAcompanhantes: dados.nomesAcompanhantes,
    mensagem: dados.mensagem,
    ipOrigem: ip,
  });

  revalidatePath(`/painel/rsvp`);

  return NextResponse.json({ ok: true });
}
