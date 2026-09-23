"use client";

import { useEffect, useState } from "react";

function calcular(alvo: number) {
  const diff = Math.max(0, alvo - Date.now());
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

export function Contagem({ dataAlvo }: { dataAlvo: string }) {
  const alvo = new Date(dataAlvo).getTime();
  const [valores, setValores] = useState<ReturnType<typeof calcular> | null>(
    null
  );

  useEffect(() => {
    setValores(calcular(alvo));
    const id = setInterval(() => setValores(calcular(alvo)), 1000);
    return () => clearInterval(id);
  }, [alvo]);

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
