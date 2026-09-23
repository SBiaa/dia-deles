"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { esquemaPresente } from "@/lib/validacao/presentes";
import {
  criarPresente as salvarPresente,
  arquivarPresente as arquivar,
  cancelarReserva as cancelar,
} from "@/lib/db/queries/presentes";

export type EstadoFormularioPresente = { erro?: string } | undefined;

export async function criarPresente(
  _estado: EstadoFormularioPresente,
  formData: FormData
): Promise<EstadoFormularioPresente> {
  const usuario = await exigirSessao();

  const validado = esquemaPresente.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    preco: formData.get("preco"),
  });

  if (!validado.success) {
    return { erro: "Confira os campos preenchidos." };
  }

  await salvarPresente({
    casamentoId: usuario.casamentoId,
    nome: validado.data.nome,
    descricao: validado.data.descricao,
    precoCentavos: validado.data.preco,
    imagemUrl: null,
  });

  revalidatePath("/painel/presentes");
  revalidatePath(`/${usuario.slug}`);
}

export async function arquivarPresente(id: string) {
  const usuario = await exigirSessao();
  await arquivar(id, usuario.casamentoId);
  revalidatePath("/painel/presentes");
  revalidatePath(`/${usuario.slug}`);
}

export async function liberarReserva(reservaId: string) {
  const usuario = await exigirSessao();
  await cancelar(reservaId, usuario.casamentoId);
  revalidatePath("/painel/presentes");
  revalidatePath(`/${usuario.slug}`);
}
