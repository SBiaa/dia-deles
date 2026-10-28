"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FileStack,
  Gift,
  Globe,
  Heart,
  House,
  Images,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  QrCode,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type Item = { href: string; rotulo: string; icone: LucideIcon };
type Grupo = { titulo: string | null; itens: Item[] };

const grupos: Grupo[] = [
  {
    titulo: null,
    itens: [{ href: "/painel", rotulo: "Visão geral", icone: House }],
  },
  {
    titulo: "Site",
    itens: [{ href: "/painel/site", rotulo: "Meu site", icone: Globe }],
  },
  {
    titulo: "Convidados",
    itens: [
      { href: "/painel/convidados", rotulo: "Convidados", icone: Users },
      { href: "/painel/mesas", rotulo: "Mesas", icone: LayoutGrid },
      { href: "/painel/padrinhos", rotulo: "Padrinhos", icone: Heart },
      { href: "/painel/presentes", rotulo: "Presentes", icone: Gift },
    ],
  },
  {
    titulo: "Planejamento",
    itens: [
      { href: "/painel/tarefas", rotulo: "Checklist", icone: ListChecks },
      { href: "/painel/custos", rotulo: "Financeiro", icone: Wallet },
      { href: "/painel/orcamentos", rotulo: "Orçamentos", icone: FileStack },
    ],
  },
  {
    titulo: "No dia",
    itens: [
      { href: "/painel/cronograma", rotulo: "Cronograma", icone: CalendarClock },
      { href: "/painel/checkin", rotulo: "Check-in", icone: QrCode },
      { href: "/painel/galeria", rotulo: "Galeria", icone: Images },
    ],
  },
  {
    titulo: null,
    itens: [
      { href: "/painel/configuracoes", rotulo: "Configurações", icone: Settings },
      { href: "/painel/suporte", rotulo: "Ajuda e suporte", icone: LifeBuoy },
    ],
  },
];

function useAtivo() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/painel" ? pathname === href : pathname.startsWith(href);
}

/** Navegação lateral (desktop). */
export function NavegacaoLateral() {
  const ativo = useAtivo();
  return (
    <nav aria-label="Painel" className="flex flex-col gap-5">
      {grupos.map((grupo, i) => (
        <div key={i} className="flex flex-col gap-1">
          {grupo.titulo && (
            <p className="px-3 pb-1 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              {grupo.titulo}
            </p>
          )}
          {grupo.itens.map(({ href, rotulo, icone: Icone }) => {
            const atual = ativo(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={atual ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  atual
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-foreground/75 hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icone size={18} aria-hidden />
                {rotulo}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Navegação em pílulas rolável (celular e tablet). */
export function NavegacaoHorizontal() {
  const ativo = useAtivo();
  const itens = grupos.flatMap((g) => g.itens);
  return (
    <nav
      aria-label="Painel"
      className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]"
    >
      {itens.map(({ href, rotulo, icone: Icone }) => {
        const atual = ativo(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={atual ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              atual
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-card text-foreground/75"
            }`}
          >
            <Icone size={16} aria-hidden />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
