import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { buscarCasamentoPorGaleriaToken } from "@/lib/db/queries/galeria";
import { dentroDoLimite, ipDe } from "@/lib/limite";

/** Gera o token de upload direto ao Blob, só se a galeria estiver aberta. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;
  if (!(await dentroDoLimite(`galeria-upload:${ipDe(request.headers)}`, 60, 600))) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }
  const casamento = await buscarCasamentoPorGaleriaToken(token);
  if (!casamento) {
    return NextResponse.json({ error: "Galeria indisponível." }, { status: 404 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(`galeria/${token}/`) || pathname.includes("..")) {
          throw new Error("Caminho de arquivo inválido.");
        }
        return {
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
        maximumSizeInBytes: 12 * 1024 * 1024,
        addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
