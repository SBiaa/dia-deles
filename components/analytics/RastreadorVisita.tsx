"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const CAMINHOS_RASTREADOS = ["/", "/cadastro", "/login", "/contato"];

function ehRastreado(caminho: string) {
  return CAMINHOS_RASTREADOS.includes(caminho) || caminho.startsWith("/painel");
}

function lerCookie(nome: string): string | null {
  const par = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${nome}=`));
  return par ? decodeURIComponent(par.slice(nome.length + 1)) : null;
}

function gravarCookie(nome: string, valor: string) {
  document.cookie = `${nome}=${encodeURIComponent(valor)}; path=/; max-age=31536000; samesite=lax`;
}

function descobrirOrigem(): string {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  if (utm) return utm.toLowerCase().slice(0, 40);
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && host !== window.location.hostname) return host.slice(0, 40);
    }
  } catch {
    // referrer inválido: trata como acesso direto
  }
  return "direto";
}

/** Registra páginas vistas (sem dados pessoais) para as métricas do admin. */
export function RastreadorVisita() {
  const caminho = usePathname();

  useEffect(() => {
    if (!ehRastreado(caminho)) return;

    let vid = lerCookie("hera_vid");
    if (!vid) {
      vid = crypto.randomUUID();
      gravarCookie("hera_vid", vid);
      gravarCookie("hera_origem", descobrirOrigem());
    }
    const origem = lerCookie("hera_origem") ?? "direto";

    const corpo = JSON.stringify({ vid, caminho, origem });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/visita",
        new Blob([corpo], { type: "application/json" })
      );
    } else {
      fetch("/api/visita", {
        method: "POST",
        body: corpo,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    }
  }, [caminho]);

  return null;
}
