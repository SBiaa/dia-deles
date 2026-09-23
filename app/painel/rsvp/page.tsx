import { exigirSessao } from "@/lib/dal";
import { listarRsvpsPorCasamento } from "@/lib/db/queries/rsvp";

export default async function PaginaRsvp() {
  const usuario = await exigirSessao();
  const respostas = await listarRsvpsPorCasamento(usuario.casamentoId);

  const confirmados = respostas.filter((r) => r.confirmado);
  const totalPessoas = confirmados.reduce(
    (soma, r) => soma + 1 + r.numero_acompanhantes,
    0
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl text-foreground">Confirmações</h1>

      <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{confirmados.length}</strong>{" "}
          confirmaram
        </span>
        <span>
          <strong className="text-foreground">{totalPessoas}</strong> pessoas
          no total
        </span>
        <span>
          <strong className="text-foreground">
            {respostas.length - confirmados.length}
          </strong>{" "}
          não vão
        </span>
      </div>

      {respostas.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          Ainda não chegou nenhuma confirmação.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Vai?</th>
                <th className="px-4 py-2 font-medium">Acompanhantes</th>
                <th className="px-4 py-2 font-medium">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {respostas.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2 text-foreground">
                    {r.nome_convidado}
                  </td>
                  <td className="px-4 py-2">
                    {r.confirmado ? "Sim" : "Não"}
                  </td>
                  <td className="px-4 py-2">
                    {r.confirmado ? r.numero_acompanhantes : "–"}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {r.mensagem ?? "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
