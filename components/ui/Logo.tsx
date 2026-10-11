import Image from "next/image";
import Link from "next/link";

type PropsLogo = {
  tamanho?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
};

// A imagem tem proporção 488:156; a altura define o tamanho.
const alturas = { sm: 28, md: 36, lg: 56 } as const;
const PROPORCAO = 488 / 156;

/** Logotipo Hera (azul-petróleo, com o ramo de oliveira no H). */
export function Logo({ tamanho = "md", href = "/", className = "" }: PropsLogo) {
  const altura = alturas[tamanho];
  const imagem = (
    <Image
      src="/logo-hera.png"
      alt="Hera"
      width={Math.round(altura * PROPORCAO)}
      height={altura}
      priority={tamanho !== "sm"}
      className={`w-auto ${className}`}
      style={{ height: altura }}
    />
  );

  if (href === null) return imagem;
  return (
    <Link href={href} aria-label="Hera — início" className="inline-block">
      {imagem}
    </Link>
  );
}
