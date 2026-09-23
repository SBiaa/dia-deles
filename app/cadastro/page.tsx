import Link from "next/link";
import { FormularioCadastro } from "@/components/auth/FormularioCadastro";

export default function PaginaCadastro() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="font-serif text-sm tracking-widest text-accent uppercase">
          dia deles
        </p>
        <h1 className="mt-1 font-serif text-2xl text-foreground">
          Crie o site do seu casamento
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Leva menos de dois minutos. Você edita tudo depois.
        </p>

        <div className="mt-6">
          <FormularioCadastro />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
