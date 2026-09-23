import { exigirSessao } from "@/lib/dal";
import { FormularioSlug } from "@/components/painel/FormularioSlug";
import { FormularioSenha } from "@/components/painel/FormularioSenha";

export default async function PaginaConfiguracoes() {
  const usuario = await exigirSessao();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-10">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Configurações</h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg text-foreground">
          Endereço do site
        </h2>
        <p className="text-sm text-muted-foreground">
          Se você já compartilhou o link antigo, ele deixa de funcionar.
        </p>
        <FormularioSlug slugAtual={usuario.slug} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-lg text-foreground">Senha</h2>
        <FormularioSenha />
      </section>
    </div>
  );
}
