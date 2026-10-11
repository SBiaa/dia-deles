"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2 } from "lucide-react";

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
      <span className="text-sm text-muted-foreground">Foto de capa</span>
      <input type="hidden" name="fotoCapaUrl" value={url} />

      <label
        className={`group relative flex h-52 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border transition ${
          url
            ? "border-border"
            : "border-dashed border-border bg-background hover:border-accent/50 hover:bg-accent/5"
        } ${enviando ? "pointer-events-none opacity-70" : ""}`}
      >
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Foto de capa"
            className="absolute inset-0 size-full object-cover"
          />
        )}

        <span
          className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            url
              ? "bg-black/55 text-white opacity-0 transition group-hover:opacity-100"
              : "text-accent"
          }`}
        >
          {enviando ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <ImagePlus size={16} aria-hidden />
          )}
          {enviando
            ? "Enviando..."
            : url
              ? "Trocar foto"
              : "Escolher uma foto do casal"}
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={aoSelecionar}
          disabled={enviando}
          className="sr-only"
        />
      </label>

      <p className="text-xs text-muted-foreground">
        JPG, PNG ou WebP. Aparece no topo do site dos convidados.
      </p>
      {erro && <p className="text-xs text-rosa">{erro}</p>}
    </div>
  );
}
