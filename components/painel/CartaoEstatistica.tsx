import type { LucideIcon } from "lucide-react";

type Props = {
  rotulo: string;
  valor: number | string;
  icone: LucideIcon;
  /** Classes de fundo/texto do ícone, ex.: "bg-verde/10 text-verde". */
  cor: string;
};

export function CartaoEstatistica({ rotulo, valor, icone: Icone, cor }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(20,38,45,0.04)]">
      <span
        className={`flex size-10 items-center justify-center rounded-xl ${cor}`}
      >
        <Icone size={20} aria-hidden />
      </span>
      <p
        className={`mt-4 font-serif leading-none text-foreground ${
          typeof valor === "string" ? "text-2xl" : "text-4xl"
        }`}
      >
        {valor}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{rotulo}</p>
    </div>
  );
}
