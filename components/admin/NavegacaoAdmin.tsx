"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, LifeBuoy, Users } from "lucide-react";

const itens = [
  { href: "/admin", rotulo: "Visão geral", icone: ChartNoAxesCombined },
  { href: "/admin/casais", rotulo: "Casais", icone: Users },
  { href: "/admin/suporte", rotulo: "Suporte", icone: LifeBuoy },
];

export function NavegacaoAdmin() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-2 overflow-x-auto">
      {itens.map(({ href, rotulo, icone: Icone }) => {
        const atual =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={atual ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              atual
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-card text-foreground/75 hover:text-foreground"
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
