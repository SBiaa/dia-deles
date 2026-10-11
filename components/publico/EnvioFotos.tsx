"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Camera, CircleCheck, Loader2 } from "lucide-react";

const CHAVE_NOME = "hera:galeria:nome";

export function EnvioFotos({
  token,
  moderada,
}: {
  token: string;
  moderada: boolean;
}) {
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState({ feitas: 0, total: 0 });
  const [resultado, setResultado] = useState<{
    ok: number;
    falhas: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE_NOME);
      if (salvo) setNome(salvo);
    } catch {
      // Sem armazenamento local: o nome só vale nesta visita.
    }
  }, []);

  async function enviar(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0 || !nome.trim()) return;
    try {
      window.localStorage.setItem(CHAVE_NOME, nome.trim());
    } catch {
      // ignora
    }

    const lista = Array.from(arquivos);
    setEnviando(true);
    setResultado(null);
    setProgresso({ feitas: 0, total: lista.length });

    let ok = 0;
    let falhas = 0;
    for (const arquivo of lista) {
      try {
        const blob = await upload(`galeria/${arquivo.name}`, arquivo, {
          access: "public",
          handleUploadUrl: `/api/galeria/${token}/upload`,
        });
        const resposta = await fetch(`/api/galeria/${token}/fotos`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: blob.url, nome: nome.trim() }),
        });
        if (resposta.ok) ok += 1;
        else falhas += 1;
      } catch {
        falhas += 1;
      }
      setProgresso((p) => ({ ...p, feitas: p.feitas + 1 }));
    }

    setEnviando(false);
    setResultado({ ok, falhas });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-serif text-xl text-foreground">Envie suas fotos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tem foto do dia? Mande para os noivos. Dá para escolher várias de uma
        vez.
      </p>

      <label className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
        Seu nome
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={60}
          placeholder="Como você quer aparecer"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        id="fotos-galeria"
        disabled={enviando || !nome.trim()}
        onChange={(e) => enviar(e.target.files)}
      />
      <label
        htmlFor="fotos-galeria"
        className={`mt-4 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
          enviando || !nome.trim()
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : "cursor-pointer bg-accent text-accent-foreground hover:opacity-90"
        }`}
      >
        {enviando ? (
          <Loader2 size={18} className="animate-spin" aria-hidden />
        ) : (
          <Camera size={18} aria-hidden />
        )}
        {enviando
          ? `Enviando ${Math.min(progresso.feitas + 1, progresso.total)} de ${progresso.total}...`
          : nome.trim()
            ? "Escolher fotos"
            : "Digite seu nome para enviar"}
      </label>

      {resultado && (
        <div
          role="status"
          className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${
            resultado.falhas === 0
              ? "bg-verde/10 text-verde"
              : "bg-rosa/10 text-rosa"
          }`}
        >
          <CircleCheck size={18} aria-hidden className="mt-0.5 shrink-0" />
          <p>
            {resultado.ok > 0 &&
              `${resultado.ok} ${resultado.ok === 1 ? "foto enviada" : "fotos enviadas"}. ${
                moderada
                  ? "Os noivos vão aprovar antes de aparecerem na galeria."
                  : "Já estão na galeria."
              }`}
            {resultado.falhas > 0 &&
              ` ${resultado.falhas} não ${resultado.falhas === 1 ? "pôde" : "puderam"} ser ${resultado.falhas === 1 ? "enviada" : "enviadas"}. Tente de novo.`}
          </p>
        </div>
      )}
    </section>
  );
}
