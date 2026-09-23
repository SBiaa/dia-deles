"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export function CampoFotoCapa({
  urlInicial,
}: {
  urlInicial: string | null;
}) {
  const [url, setUrl] = useState(urlInicial ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aoSelecionar(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setEnviando(true);
    setErro(null);
    try {
      const resultado = await upload(arquivo.name, arquivo, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setUrl(resultado.url);
    } catch {
      setErro("Não foi possível enviar a imagem.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-muted-foreground">Foto de capa</label>
      <input type="hidden" name="fotoCapaUrl" value={url} />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Foto de capa"
          className="h-40 w-full rounded-lg object-cover"
        />
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={aoSelecionar}
        disabled={enviando}
        className="text-sm text-muted-foreground"
      />
      {enviando && (
        <p className="text-xs text-muted-foreground">Enviando...</p>
      )}
      {erro && <p className="text-xs text-accent">{erro}</p>}
    </div>
  );
}
