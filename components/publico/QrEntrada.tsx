"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR do convite para apresentar na entrada; aponta para a própria página. */
export function QrEntrada({ nome }: { nome: string }) {
  const [imagem, setImagem] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}${window.location.pathname}`;
    QRCode.toDataURL(url, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: "M",
      color: { dark: "#14262d", light: "#ffffff" },
    })
      .then(setImagem)
      .catch(() => setImagem(null));
  }, []);

  if (!imagem) return null;

  return (
    <div className="mx-auto mt-8 flex max-w-xs flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagem}
        alt={`QR code de entrada de ${nome}`}
        className="size-48"
      />
      <p className="mt-3 font-serif text-lg text-foreground">
        Seu QR de entrada
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Mostre este código na chegada para agilizar o check-in.
      </p>
      <a
        href={imagem}
        download={`qr-${nome.toLowerCase().replace(/\s+/g, "-")}.png`}
        className="mt-3 text-sm text-accent underline"
      >
        Salvar imagem
      </a>
    </div>
  );
}
