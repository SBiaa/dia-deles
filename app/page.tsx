import Link from "next/link";
import { CalendarHeart, Gift, MailCheck } from "lucide-react";
import { Botao } from "@/components/ui/Botao";
import { Logo } from "@/components/ui/Logo";

const beneficios = [
  {
    icone: CalendarHeart,
    titulo: "A história de vocês",
    texto: "Uma página bonita com foto, data, local e a contagem regressiva.",
  },
  {
    icone: MailCheck,
    titulo: "Confirmação sem correria",
    texto: "Convite pessoal por WhatsApp e a lista de presença sempre em dia.",
  },
  {
    icone: Gift,
    titulo: "Presentes com carinho",
    texto: "Uma lista para quem quer presentear, sem planilha nem confusão.",
  },
];

export default function PaginaInicial() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Logo tamanho="md" href={null} />
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Entrar
        </Link>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden px-6 pt-16 pb-24 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-sol-suave blur-3xl"
          />
          <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
            para casais que gostam de fazer juntos
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            O dia é de vocês.{" "}
            <em className="font-normal text-accent italic">O site também.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
            Conte a história, organize a confirmação de presença e a lista de
            presentes em um só lugar, pronto em minutos.
          </p>
          <Link href="/cadastro" className="mt-9 inline-block">
            <Botao className="px-7 py-3 text-base">Criar nosso site</Botao>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Grátis para começar. Vocês editam tudo depois.
          </p>
        </section>

        <section className="mx-auto grid w-full max-w-5xl gap-5 px-6 pb-24 sm:grid-cols-3">
          {beneficios.map(({ icone: Icone, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-sol-suave text-accent">
                <Icone size={20} aria-hidden />
              </span>
              <h2 className="mt-4 font-serif text-xl text-foreground">
                {titulo}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {texto}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <Logo tamanho="sm" href={null} className="opacity-80" />
        <p className="mt-3">Feito com carinho para o dia de vocês.</p>
      </footer>
    </>
  );
}
