"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { esquemaSite } from "@/lib/validacao/site";
import { atualizarSite as salvarSite, definirPublicado } from "@/lib/db/queries/casamentos";

export type EstadoFormularioSite =
  | { erro?: string; salvo?: boolean }
  | undefined;

export async function atualizarSite(
  _estado: EstadoFormularioSite,
  formData: FormData
): Promise<EstadoFormularioSite> {
  const usuario = await exigirSessao();

  const validado = esquemaSite.safeParse({
    nomeParceiro1: formData.get("nomeParceiro1"),
    nomeParceiro2: formData.get("nomeParceiro2"),
    dataCasamento: formData.get("dataCasamento"),
    historiaTitulo: formData.get("historiaTitulo"),
    historiaTexto: formData.get("historiaTexto"),
    cerimoniaLocalNome: formData.get("cerimoniaLocalNome"),
    cerimoniaEndereco: formData.get("cerimoniaEndereco"),
    cerimoniaDataHora: formData.get("cerimoniaDataHora"),
    cerimoniaMapaUrl: formData.get("cerimoniaMapaUrl"),
    recepcaoLocalNome: formData.get("recepcaoLocalNome"),
    recepcaoEndereco: formData.get("recepcaoEndereco"),
    recepcaoDataHora: formData.get("recepcaoDataHora"),
    recepcaoMapaUrl: formData.get("recepcaoMapaUrl"),
    instagramUrl: formData.get("instagramUrl"),
    fotoCapaUrl: formData.get("fotoCapaUrl"),
  });

  if (!validado.success) {
    return { erro: "Confira os campos preenchidos." };
  }

  await salvarSite(usuario.casamentoId, validado.data);
  revalidatePath("/painel/site");
  revalidatePath(`/${usuario.slug}`);

  return { salvo: true };
}

export async function publicar() {
  const usuario = await exigirSessao();
  await definirPublicado(usuario.casamentoId, true);
  revalidatePath("/painel");
  revalidatePath(`/${usuario.slug}`);
}

export async function despublicar() {
  const usuario = await exigirSessao();
  await definirPublicado(usuario.casamentoId, false);
  revalidatePath("/painel");
  revalidatePath(`/${usuario.slug}`);
}
