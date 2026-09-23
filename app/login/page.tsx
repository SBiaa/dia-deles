import Link from "next/link";
import { FormularioLogin } from "@/components/auth/FormularioLogin";

export default function PaginaLogin() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="font-serif text-sm tracking-widest text-accent uppercase">
          dia deles
        </p>
        <h1 className="mt-1 font-serif text-2xl text-foreground">Entrar</h1>

        <div className="mt-6">
          <FormularioLogin />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem site?{" "}
          <Link href="/cadastro" className="text-accent underline">
            Criar agora
          </Link>
        </p>
      </div>
    </main>
  );
}
