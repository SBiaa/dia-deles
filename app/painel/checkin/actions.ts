"use server";

import { revalidatePath } from "next/cache";
import { exigirSessao } from "@/lib/dal";
import { extrairCodigo, pessoasEsperadas } from "@/lib/checkin";
import {
  buscarConvidadoComMesaPorCodigo,
  buscarConvidadoComMesaPorId,
  desfazerCheckin as desfazer,
  registrarCheckin,
  type ConvidadoComMesa,
} from "@/lib/db/queries/convidados";

const CAMINHO = "/painel/checkin";

export type ConvidadoCheckin = {
  id: string;
  nome: string;
  pessoas: number;
  esperadas: number;
  mesa: string | null;
  lado: string | null;
  confirmado: boolean | null;
};

export type ResultadoCheckin =
  | { status: "ok" | "ja_chegou" | "nao_confirmado"; convidado: ConvidadoCheckin }
  | { status: "nao_encontrado" };

function paraResultado(c: ConvidadoComMesa): ConvidadoCheckin {
  return {
    id: c.id,
    nome: c.nome,
    pessoas: c.checkin_pessoas ?? pessoasEsperadas(c),
    esperadas: pessoasEsperadas(c),
    mesa: c.mesa_nome,
    lado: c.lado,
    confirmado: c.confirmado,
  };
}

/** Lê o QR/código na entrada e registra a chegada, quando faz sentido. */
export async function checkinPorCodigo(texto: string): Promise<ResultadoCheckin> {
  const usuario = await exigirSessao();
  const codigo = extrairCodigo(texto);
  if (!codigo) return { status: "nao_encontrado" };

  const convidado = await buscarConvidadoComMesaPorCodigo(
    codigo,
    usuario.casamentoId
  );
  if (!convidado) return { status: "nao_encontrado" };

  if (convidado.checkin_em) {
    return { status: "ja_chegou", convidado: paraResultado(convidado) };
  }
  if (convidado.confirmado !== true) {
    return { status: "nao_confirmado", convidado: paraResultado(convidado) };
  }

  await registrarCheckin(
    convidado.id,
    usuario.casamentoId,
    pessoasEsperadas(convidado)
  );
  revalidatePath(CAMINHO);
  const atualizado = await buscarConvidadoComMesaPorId(
    convidado.id,
    usuario.casamentoId
  );
  return {
    status: "ok",
    convidado: paraResultado(atualizado ?? convidado),
  };
}

/** Check-in manual (lista) ou "registrar mesmo assim" de quem não confirmou. */
export async function checkinPorId(id: string): Promise<ResultadoCheckin> {
  const usuario = await exigirSessao();
  const convidado = await buscarConvidadoComMesaPorId(id, usuario.casamentoId);
  if (!convidado) return { status: "nao_encontrado" };

  await registrarCheckin(
    convidado.id,
    usuario.casamentoId,
    convidado.checkin_pessoas ?? pessoasEsperadas(convidado)
  );
  revalidatePath(CAMINHO);
  const atualizado = await buscarConvidadoComMesaPorId(id, usuario.casamentoId);
  return { status: "ok", convidado: paraResultado(atualizado ?? convidado) };
}

export async function ajustarPessoas(id: string, pessoas: number) {
  const usuario = await exigirSessao();
  const total = Math.min(Math.max(Math.round(pessoas), 1), 50);
  await registrarCheckin(id, usuario.casamentoId, total);
  revalidatePath(CAMINHO);
}

export async function desfazerCheckin(id: string) {
  const usuario = await exigirSessao();
  await desfazer(id, usuario.casamentoId);
  revalidatePath(CAMINHO);
}
