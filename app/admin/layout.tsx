import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NavegacaoAdmin } from "@/components/admin/NavegacaoAdmin";
import { exigirAdmin } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  await exigirAdmin();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo tamanho="sm" href="/admin" />
            <span className="rounded-full bg-sol-suave px-2.5 py-0.5 text-xs font-medium text-foreground">
              Admin
            </span>
          </div>
          <Link
            href="/painel"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} aria-hidden /> Voltar ao painel
          </Link>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-8">
          <NavegacaoAdmin />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
