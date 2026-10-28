"use client";

import { useSyncExternalStore } from "react";

// Relógio que avisa a cada segundo; no servidor não há hora (mostra "–").
function assinarRelogio(avisar: () => void) {
  const id = setInterval(avisar, 1000);
  return () => clearInterval(id);
}
const segundoAtual = () => Math.floor(Date.now() / 1000);
const semHora = () => null;

function calcular(alvo: number, agora: number) {
  const diff = Math.max(0, alvo - agora);
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

export function Contagem({ dataAlvo }: { dataAlvo: string }) {
  const alvo = new Date(dataAlvo).getTime();
  const segundo = useSyncExternalStore(assinarRelogio, segundoAtual, semHora);
  const valores = segundo === null ? null : calcular(alvo, segundo * 1000);

  const unidades = [
    { rotulo: "dias", valor: valores?.dias },
    { rotulo: "horas", valor: valores?.horas },
    { rotulo: "min", valor: valores?.minutos },
    { rotulo: "seg", valor: valores?.segundos },
  ];

  return (
    <div className="flex gap-4 sm:gap-6" suppressHydrationWarning>
      {unidades.map((u) => (
        <div key={u.rotulo} className="flex flex-col items-center">
          <span className="font-serif text-3xl text-foreground sm:text-4xl">
            {u.valor ?? "–"}
          </span>
          <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {u.rotulo}
          </span>
        </div>
      ))}
    </div>
  );
}
