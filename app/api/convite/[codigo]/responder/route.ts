import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { esquemaResposta } from "@/lib/validacao/convidados";
import {
  buscarConvidadoPorCodigo,
  registrarResposta,
} from "@/lib/db/queries/convidados";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params;
  const formData = await request.formData();

  const validado = esquemaResposta.safeParse({
    confirmado: formData.get("confirmado"),
    numeroAcompanhantes: formData.get("numeroAcompanhantes"),
    nomesAcompanhantes: formData.get("nomesAcompanhantes"),
    mensagem: formData.get("mensagem"),
  });

  if (!validado.success) {
    return NextResponse.json(
      { erro: "Confira os campos preenchidos." },
      { status: 400 }
    );
  }

  const convidado = await buscarConvidadoPorCodigo(codigo);
  if (!convidado) {
    return NextResponse.json({ erro: "Convite não encontrado." }, { status: 404 });
  }

  const casamento = await buscarCasamentoPorId(convidado.casamento_id);
  if (!casamento?.publicado) {
    return NextResponse.json({ erro: "Convite não encontrado." }, { status: 404 });
  }

  const dados = validado.data;
  const numeroAcompanhantes = Math.min(
    dados.numeroAcompanhantes,
    convidado.limite_acompanhantes
  );

  await registrarResposta(codigo, {
    confirmado: dados.confirmado,
    numeroAcompanhantes: dados.confirmado ? numeroAcompanhantes : 0,
    nomesAcompanhantes: dados.confirmado ? dados.nomesAcompanhantes : null,
    mensagem: dados.mensagem,
  });

  revalidatePath("/painel/convidados");

  return NextResponse.json({ ok: true });
}
