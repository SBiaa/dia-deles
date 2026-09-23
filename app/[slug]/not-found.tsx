import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-serif text-sm tracking-widest text-accent uppercase">
        dia deles
      </p>
      <h1 className="mt-4 font-serif text-3xl text-foreground">
        Este site não existe (ainda)
      </h1>
      <p className="mt-2 text-muted-foreground">
        Confira se o endereço está certo.
      </p>
      <Link href="/" className="mt-6 text-accent underline">
        Voltar para o início
      </Link>
    </main>
  );
}
