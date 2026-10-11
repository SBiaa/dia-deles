import { Logo } from "@/components/ui/Logo";
import { notFound } from "next/navigation";
import { buscarUsuarioPorTokenDefinirSenha } from "@/lib/db/queries/usuarios";
import { FormularioDefinirSenha } from "@/components/auth/FormularioDefinirSenha";

export default async function PaginaDefinirSenha(
  props: PageProps<"/definir-senha/[token]">
) {
  const { token } = await props.params;
  const usuario = await buscarUsuarioPorTokenDefinirSenha(token);

  if (!usuario) {
    notFound();
  }

  const expirado =
    usuario.token_definir_senha_expira_em !== null &&
    new Date(usuario.token_definir_senha_expira_em) < new Date();

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Logo tamanho="sm" />
        <h1 className="mt-1 font-serif text-2xl text-foreground">
          Olá, {usuario.nome}!
        </h1>

        {expirado ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Esse link expirou. Fale com a gente pra gerar um novo.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Falta só criar sua senha pra acessar o painel do seu site.
            </p>
            <div className="mt-6">
              <FormularioDefinirSenha token={token} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
