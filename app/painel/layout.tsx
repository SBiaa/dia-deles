import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { ehAdmin } from "@/lib/admin";
import { Logo } from "@/components/ui/Logo";
import {
  NavegacaoHorizontal,
  NavegacaoLateral,
} from "@/components/painel/NavegacaoPainel";
import { auth } from "@/lib/auth";
import { sair } from "@/app/actions/auth";

export default async function LayoutPainel({
  children,
}: LayoutProps<"/painel">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const nome = session.user.name ?? "";
  const inicial = nome.trim().charAt(0).toUpperCase() || "H";

  const admin = ehAdmin(session.user.email);

  const linkAdmin = admin ? (
    <Link
      href="/admin"
      className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
    >
      <ShieldCheck size={16} aria-hidden />
      Admin
    </Link>
  ) : null;

  const botaoSair = (
    <form action={sair}>
      <button
        type="submit"
        className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <LogOut size={16} aria-hidden />
        Sair
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: barra lateral fixa */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex print:hidden">
        <div className="px-3">
          <Logo tamanho="md" href="/painel" />
        </div>
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavegacaoLateral />
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-border px-3 pt-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sol-suave font-serif text-base text-accent">
            {inicial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {nome}
            </p>
            <div className="flex items-center gap-4">
              {botaoSair}
              {linkAdmin}
            </div>
          </div>
        </div>
      </aside>

      {/* Celular/tablet: topo com logo + pílulas */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 pt-4 backdrop-blur lg:hidden print:hidden">
        <div className="flex items-center justify-between px-4 pb-3">
          <Logo tamanho="sm" href="/painel" />
          <div className="flex items-center gap-4">
            {linkAdmin}
            {botaoSair}
          </div>
        </div>
        <NavegacaoHorizontal />
      </header>

      <main className="px-4 py-8 sm:px-8 lg:pl-[calc(16rem+2.5rem)] lg:pr-10 lg:py-10 print:p-0 print:lg:p-0">
        {children}
      </main>
    </div>
  );
}
