import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ehAdmin } from "@/lib/admin";
import { registrarVisita } from "@/lib/db/queries/visitas";

const UUID = /^[0-9a-f-]{36}$/i;
const CAMINHO = /^\/[a-z0-9/_-]{0,80}$/i;

export async function POST(request: Request) {
  try {
    const dados = (await request.json()) as {
      vid?: unknown;
      caminho?: unknown;
      origem?: unknown;
    };
    if (
      typeof dados.vid !== "string" ||
      !UUID.test(dados.vid) ||
      typeof dados.caminho !== "string" ||
      !CAMINHO.test(dados.caminho)
    ) {
      return new NextResponse(null, { status: 204 });
    }

    const session = await auth();
    // Visitas do próprio admin não entram nas métricas.
    if (ehAdmin(session?.user?.email)) {
      return new NextResponse(null, { status: 204 });
    }

    const origem =
      typeof dados.origem === "string"
        ? dados.origem.replace(/[^a-z0-9._-]/gi, "").slice(0, 40) || null
        : null;

    await registrarVisita({
      visitanteId: dados.vid,
      usuarioId: session?.user?.id ?? null,
      caminho: dados.caminho,
      origem,
    });
  } catch {
    // métricas nunca devem quebrar a navegação
  }
  return new NextResponse(null, { status: 204 });
}
