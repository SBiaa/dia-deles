import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  FileStack,
  Gift,
  Globe,
  Heart,
  Images,
  LayoutGrid,
  ListChecks,
  MailCheck,
  QrCode,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

type Recurso = { icone: LucideIcon; titulo: string; texto: string };
type Fase = { rotulo: string; titulo: string; cor: string; recursos: Recurso[] };

const fases: Fase[] = [
  {
    rotulo: "Antes",
    titulo: "Planejem sem planilha",
    cor: "text-verde bg-verde/10",
    recursos: [
      {
        icone: ListChecks,
        titulo: "Checklist por etapa",
        texto: "Tarefas sugeridas mês a mês, do noivado à semana do casamento.",
      },
      {
        icone: Wallet,
        titulo: "Financeiro",
        texto: "Custos, parcelas e próximos vencimentos sempre à vista.",
      },
      {
        icone: FileStack,
        titulo: "Orçamentos",
        texto: "Comparem propostas de fornecedores lado a lado.",
      },
    ],
  },
  {
    rotulo: "Convidados",
    titulo: "Todo mundo no mesmo lugar",
    cor: "text-rosa bg-rosa/10",
    recursos: [
      {
        icone: Globe,
        titulo: "Site do casamento",
        texto: "História, foto de capa, local e contagem regressiva.",
      },
      {
        icone: MailCheck,
        titulo: "Convite e confirmação",
        texto: "Convite pessoal pelo WhatsApp e lista de presença em dia.",
      },
      {
        icone: Gift,
        titulo: "Lista de presentes",
        texto: "Convidados reservam o presente, sem duplicar ninguém.",
      },
      {
        icone: LayoutGrid,
        titulo: "Mapa de mesas",
        texto: "Distribuam os convidados e vejam quem senta com quem.",
      },
      {
        icone: Heart,
        titulo: "Padrinhos",
        texto: "Um cantinho só para eles, com convite e orientações.",
      },
      {
        icone: Users,
        titulo: "Lista de convidados",
        texto: "Grupos, telefones e restrições alimentares organizados.",
      },
    ],
  },
  {
    rotulo: "No dia",
    titulo: "Curtam a festa",
    cor: "text-accent bg-accent/10",
    recursos: [
      {
        icone: CalendarClock,
        titulo: "Cronograma",
        texto: "Roteiro do dia compartilhado com fornecedores e cerimonial.",
      },
      {
        icone: QrCode,
        titulo: "Check-in por QR",
        texto: "Recepção rápida na entrada, direto pelo celular.",
      },
      {
        icone: Images,
        titulo: "Galeria colaborativa",
        texto: "Os convidados enviam as fotos e tudo fica guardado num álbum.",
      },
    ],
  },
];

const passos = [
  {
    titulo: "Criem a conta",
    texto: "Nome do casal, e-mail e a data do casamento. Leva um minuto.",
  },
  {
    titulo: "Deixem com a cara de vocês",
    texto: "Foto de capa, a história, local da cerimônia e presentes.",
  },
  {
    titulo: "Compartilhem",
    texto: "Mandem o convite pelo WhatsApp e acompanhem as respostas.",
  },
];

const perguntas = [
  {
    pergunta: "Quanto custa?",
    resposta:
      "É grátis para começar. Vocês criam o site, cadastram convidados e usam o painel sem precisar de cartão.",
  },
  {
    pergunta: "Os convidados precisam criar conta?",
    resposta:
      "Não. Cada convidado recebe um link pessoal e confirma a presença com um toque, direto do celular.",
  },
  {
    pergunta: "Precisa saber mexer com site?",
    resposta:
      "Não. Vocês preenchem as informações no painel e o site fica pronto, bonito no celular e no computador.",
  },
  {
    pergunta: "Posso escolher o endereço do site?",
    resposta:
      "Pode. O endereço é criado a partir do nome de vocês e dá para trocar quando quiserem nas configurações.",
  },
];

function PreviaSite() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_80px_-30px_rgba(19,94,115,0.35)]">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-rosa/40" />
          <span className="size-2.5 rounded-full bg-sol/50" />
          <span className="size-2.5 rounded-full bg-verde/40" />
          <span className="ml-3 truncate rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            hera.com.br/ana-e-pedro
          </span>
        </div>
        <div className="bg-gradient-to-b from-accent to-[#0d4757] px-6 py-10 text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase opacity-80">
            Ana &amp; Pedro
          </p>
          <p className="mt-3 font-serif text-4xl">14.03.2027</p>
          <div className="mt-6 flex justify-center gap-2">
            {[
              ["137", "dias"],
              ["08", "horas"],
              ["42", "min"],
            ].map(([numero, unidade]) => (
              <div
                key={unidade}
                className="w-16 rounded-xl bg-white/10 py-2 backdrop-blur"
              >
                <p className="font-serif text-xl">{numero}</p>
                <p className="text-[10px] tracking-wider uppercase opacity-75">
                  {unidade}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 px-6 py-6">
          <p className="font-serif text-lg text-foreground">Nossa história</p>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-muted" />
            <div className="h-2 w-5/6 rounded-full bg-muted" />
            <div className="h-2 w-2/3 rounded-full bg-muted" />
          </div>
          <div className="pt-2">
            <span className="inline-flex rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground">
              Confirmar presença
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -left-4 top-16 hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:flex lg:-left-16">
        <span className="flex size-8 items-center justify-center rounded-full bg-verde/10 text-verde">
          <Check size={16} aria-hidden />
        </span>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Tia Lúcia confirmou</p>
          <p className="text-xs text-muted-foreground">+ 1 acompanhante</p>
        </div>
      </div>

      <div className="absolute -right-4 bottom-10 hidden items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:flex lg:-right-14">
        <span className="flex size-8 items-center justify-center rounded-full bg-rosa/10 text-rosa">
          <Gift size={16} aria-hidden />
        </span>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Presente reservado</p>
          <p className="text-xs text-muted-foreground">Jogo de taças</p>
        </div>
      </div>
    </div>
  );
}

export default function PaginaInicial() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-transparent bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Logo tamanho="md" href={null} />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#recursos" className="hover:text-foreground">
              Recursos
            </a>
            <a href="#como-funciona" className="hover:text-foreground">
              Como funciona
            </a>
            <a href="#perguntas" className="hover:text-foreground">
              Perguntas
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90 sm:inline-flex"
            >
              Criar nosso site
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-12 pb-24 sm:pt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-sol-suave blur-3xl"
          />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
                para casais que gostam de fazer juntos
              </p>
              <h1 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                O dia é de vocês.{" "}
                <em className="font-normal text-accent italic">
                  O site também.
                </em>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground lg:mx-0">
                Site do casamento, confirmação de presença, lista de presentes
                e todo o planejamento em um só lugar. Pronto em minutos, do
                jeitinho de vocês.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-medium text-accent-foreground transition hover:opacity-90"
                >
                  Criar nosso site
                  <ArrowRight size={18} aria-hidden />
                </Link>
                <a
                  href="#recursos"
                  className="inline-flex items-center rounded-full border border-border bg-card px-7 py-3 text-base font-medium text-foreground transition hover:bg-muted"
                >
                  Ver o que dá para fazer
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Grátis para começar. Vocês editam tudo depois.
              </p>
            </div>
            <PreviaSite />
          </div>
        </section>

        {/* Faixa de destaques */}
        <section className="border-y border-border bg-card px-6 py-8">
          <ul className="mx-auto grid w-full max-w-5xl gap-6 text-center sm:grid-cols-3">
            {[
              ["12 ferramentas", "do planejamento ao pós-festa"],
              ["Sem app para baixar", "funciona no celular de qualquer convidado"],
              ["Tudo num painel só", "site, convidados e planejamento juntos"],
            ].map(([titulo, texto]) => (
              <li key={titulo}>
                <p className="font-serif text-xl text-foreground">{titulo}</p>
                <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Recursos */}
        <section id="recursos" className="scroll-mt-20 px-6 py-24">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
                Recursos
              </p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
                Do “sim” ao último brinde
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Tudo o que vocês precisam, organizado pela fase do casamento.
              </p>
            </div>

            <div className="mt-16 space-y-16">
              {fases.map((fase) => (
                <div
                  key={fase.rotulo}
                  className="grid gap-8 lg:grid-cols-[16rem_1fr]"
                >
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium tracking-wider uppercase ${fase.cor}`}
                    >
                      {fase.rotulo}
                    </span>
                    <h3 className="mt-3 font-serif text-2xl text-foreground">
                      {fase.titulo}
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {fase.recursos.map(({ icone: Icone, titulo, texto }) => (
                      <div
                        key={titulo}
                        className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <span
                          className={`flex size-10 items-center justify-center rounded-full ${fase.cor}`}
                        >
                          <Icone size={20} aria-hidden />
                        </span>
                        <h4 className="mt-4 font-medium text-foreground">
                          {titulo}
                        </h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {texto}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section
          id="como-funciona"
          className="scroll-mt-20 bg-muted px-6 py-24"
        >
          <div className="mx-auto w-full max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
                Como funciona
              </p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
                Três passos e está no ar
              </h2>
            </div>
            <ol className="mt-14 grid gap-6 sm:grid-cols-3">
              {passos.map((passo, i) => (
                <li
                  key={passo.titulo}
                  className="rounded-2xl border border-border bg-card p-7"
                >
                  <span className="font-serif text-4xl text-sol">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-serif text-xl text-foreground">
                    {passo.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {passo.texto}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Para os convidados */}
        <section className="px-6 py-24">
          <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] text-rosa uppercase">
                Para os convidados
              </p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight text-foreground">
                Simples para quem vai, tranquilo para vocês
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Cada convidado recebe um link pessoal. Sem cadastro, sem senha,
                sem app.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Confirma a presença e avisa sobre restrições alimentares",
                "Escolhe e reserva um presente da lista",
                "Recebe o QR code para entrar na festa",
                "Envia as fotos da festa para o álbum de vocês",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-verde/10 text-verde">
                    <Check size={14} aria-hidden />
                  </span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Perguntas */}
        <section
          id="perguntas"
          className="scroll-mt-20 border-t border-border px-6 py-24"
        >
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="text-center font-serif text-4xl tracking-tight text-foreground">
              Perguntas frequentes
            </h2>
            <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
              {perguntas.map(({ pergunta, resposta }) => (
                <details key={pergunta} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    {pergunta}
                    <ChevronDown
                      size={18}
                      aria-hidden
                      className="shrink-0 text-muted-foreground transition group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-3 text-muted-foreground">{resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="px-6 pb-24">
          <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] bg-accent px-8 py-16 text-center text-accent-foreground">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-sol/30 blur-3xl"
            />
            <h2 className="relative mx-auto max-w-2xl font-serif text-4xl tracking-tight sm:text-5xl">
              Bora começar o site de vocês?
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-lg opacity-85">
              Em poucos minutos ele está pronto para compartilhar.
            </p>
            <Link
              href="/cadastro"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-base font-medium text-accent transition hover:bg-sol-suave"
            >
              Criar nosso site
              <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <Logo tamanho="sm" href={null} className="opacity-80" />
          <p>Feito com carinho para o dia de vocês.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground">
              Entrar
            </Link>
            <Link href="/cadastro" className="hover:text-foreground">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
