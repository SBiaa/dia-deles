import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { auth } from "@/lib/auth";
import { FormularioChamado } from "@/components/suporte/FormularioChamado";

export const metadata: Metadata = { title: "Fale com a gente" };

export default async function PaginaContato() {
  const session = await auth();

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Logo tamanho="sm" />
        <h1 className="mt-1 font-serif text-2xl text-foreground">
          Fale com a gente
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não consegue entrar, encontrou um erro ou tem uma dúvida? Conte aqui e
          respondemos no seu e-mail.
        </p>

        <div className="mt-6">
          <FormularioChamado
            nome={session?.user?.name ?? undefined}
            email={session?.user?.email ?? undefined}
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href={session?.user ? "/painel" : "/login"}
            className="text-accent underline"
          >
            Voltar
          </Link>
        </p>
      </div>
    </main>
  );
}
