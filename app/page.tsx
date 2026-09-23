import Link from "next/link";
import { Botao } from "@/components/ui/Botao";

export default function PaginaInicial() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-serif text-sm tracking-widest text-accent uppercase">
        dia deles
      </p>
      <h1 className="mt-4 max-w-2xl font-serif text-4xl text-foreground sm:text-5xl">
        O site do seu casamento, pronto em minutos
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Conte a história de vocês, organize a confirmação de presença e a
        lista de presentes em um só lugar.
      </p>
      <Link href="/cadastro" className="mt-8">
        <Botao>Criar meu site</Botao>
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-accent underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
