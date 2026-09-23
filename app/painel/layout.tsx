import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { sair } from "@/app/actions/auth";

export default async function LayoutPainel({
  children,
}: LayoutProps<"/painel">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <Link href="/painel" className="font-serif text-lg text-foreground">
          dia deles
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/painel" className="hover:text-foreground">
            Visão geral
          </Link>
          <Link href="/painel/site" className="hover:text-foreground">
            Meu site
          </Link>
          <Link href="/painel/rsvp" className="hover:text-foreground">
            Confirmações
          </Link>
          <Link href="/painel/presentes" className="hover:text-foreground">
            Presentes
          </Link>
          <Link href="/painel/configuracoes" className="hover:text-foreground">
            Configurações
          </Link>
          <form action={sair}>
            <button type="submit" className="hover:text-foreground">
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1 bg-background px-6 py-10">{children}</main>
    </div>
  );
}
