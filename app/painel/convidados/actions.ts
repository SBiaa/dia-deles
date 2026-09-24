"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { esquemaNovoConvidado } from "@/lib/validacao/convidados";
import { gerarCodigoConvite } from "@/lib/codigos";
import {
  criarConvidado as salvarConvidado,
  marcarConfirmadoManual as marcarManual,
  removerConvidado as remover,
} from "@/lib/db/queries/convidados";

export type EstadoFormularioConvidado = { erro?: string } | undefined;

export async function criarConvidado(
  _estado: EstadoFormularioConvidado,
  formData: FormData
): Promise<EstadoFormularioConvidado> {
  const usuario = await exigirSessao();

  const validado = esquemaNovoConvidado.safeParse({
    nome: formData.get("nome"),
    lado: formData.get("lado"),
    limiteAcompanhantes: formData.get("limiteAcompanhantes"),
  });

  if (!validado.success) {
    return { erro: "Confira os campos preenchidos." };
  }

  const codigo = await gerarCodigoConvite();
  await salvarConvidado({
    casamentoId: usuario.casamentoId,
    nome: validado.data.nome,
    lado: validado.data.lado,
    limiteAcompanhantes: validado.data.limiteAcompanhantes,
    codigo,
  });

  revalidatePath("/painel/convidados");
}

export async function marcarConfirmadoManual(id: string) {
  const usuario = await exigirSessao();
  await marcarManual(id, usuario.casamentoId);
  revalidatePath("/painel/convidados");
}

export async function removerConvidado(id: string) {
  const usuario = await exigirSessao();
  await remover(id, usuario.casamentoId);
  revalidatePath("/painel/convidados");
}
