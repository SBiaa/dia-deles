import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { buscarCasamentoPorGaleriaToken } from "@/lib/db/queries/galeria";

/** Gera o token de upload direto ao Blob, só se a galeria estiver aberta. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;
  const casamento = await buscarCasamentoPorGaleriaToken(token);
  if (!casamento) {
    return NextResponse.json({ error: "Galeria indisponível." }, { status: 404 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
        maximumSizeInBytes: 12 * 1024 * 1024,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
