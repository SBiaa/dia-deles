import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { esquemaReserva } from "@/lib/validacao/presentes";
import {
  buscarPresentePorId,
  criarReserva,
  PresenteJaReservadoError,
} from "@/lib/db/queries/presentes";
import { buscarCasamentoPorId } from "@/lib/db/queries/casamentos";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();

  const validado = esquemaReserva.safeParse({
    presenteId: id,
    nomeConvidado: formData.get("nomeConvidado"),
    email: formData.get("email"),
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
  if (dados.site) {
    return NextResponse.json({ ok: true });
  }

  const presente = await buscarPresentePorId(id);
  if (!presente || !presente.ativo) {
    return NextResponse.json({ erro: "Presente não encontrado." }, { status: 404 });
  }

  const casamento = await buscarCasamentoPorId(presente.casamento_id);
  if (!casamento?.publicado) {
    return NextResponse.json({ erro: "Presente não encontrado." }, { status: 404 });
  }

  try {
    await criarReserva({
      presenteId: id,
      nomeConvidado: dados.nomeConvidado,
      emailConvidado: dados.email,
      mensagem: dados.mensagem,
    });
  } catch (err) {
    if (err instanceof PresenteJaReservadoError) {
      return NextResponse.json({ erro: err.message }, { status: 409 });
    }
    throw err;
  }

  revalidatePath(`/${casamento.slug}`);
  revalidatePath("/painel/presentes");

  return NextResponse.json({ ok: true });
}
