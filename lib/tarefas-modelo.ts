import { diasEntre, somarDias } from "@/lib/datas";

type Modelo = { titulo: string; descricao: string; diasAntes: number };

/** Checklist sugerido, em dias antes do casamento (negativo = depois). */
const MODELO: Modelo[] = [
  { titulo: "Definir o orçamento total", descricao: "Quanto vocês querem gastar e quem contribui.", diasAntes: 365 },
  { titulo: "Fazer a lista preliminar de convidados", descricao: "Ajuda a dimensionar local, buffet e orçamento.", diasAntes: 365 },
  { titulo: "Fechar o local da cerimônia e da recepção", descricao: "Os melhores locais esgotam com antecedência.", diasAntes: 330 },
  { titulo: "Contratar o buffet", descricao: "Peça pelo menos três orçamentos e prove o cardápio.", diasAntes: 300 },
  { titulo: "Contratar fotografia e filmagem", descricao: "Veja portfólios completos, não só os destaques.", diasAntes: 300 },
  { titulo: "Contratar assessoria ou cerimonialista", descricao: "Alguém para cuidar do dia enquanto vocês aproveitam.", diasAntes: 300 },
  { titulo: "Escolher padrinhos e madrinhas", descricao: "Convide com carinho e combine o que se espera deles.", diasAntes: 270 },
  { titulo: "Contratar banda ou DJ", descricao: "Defina o repertório da cerimônia e da festa.", diasAntes: 270 },
  { titulo: "Escolher o vestido e o traje", descricao: "Considere prazo de confecção e provas.", diasAntes: 240 },
  { titulo: "Contratar decoração e flores", descricao: "Alinhe estilo, paleta e orçamento.", diasAntes: 210 },
  { titulo: "Reservar a lua de mel", descricao: "Passagens e hospedagem ficam mais baratas com antecedência.", diasAntes: 180 },
  { titulo: "Encomendar bolo e doces", descricao: "Faça a degustação antes de fechar.", diasAntes: 150 },
  { titulo: "Montar a lista de presentes", descricao: "Cadastre no painel para os convidados reservarem.", diasAntes: 150 },
  { titulo: "Escolher as alianças", descricao: "Gravação costuma levar algumas semanas.", diasAntes: 120 },
  { titulo: "Enviar os convites", descricao: "Use os links pessoais do painel, por WhatsApp.", diasAntes: 120 },
  { titulo: "Contratar maquiagem e cabelo", descricao: "Marque também o teste.", diasAntes: 90 },
  { titulo: "Provas e ajustes do traje", descricao: "Leve os sapatos e acessórios.", diasAntes: 60 },
  { titulo: "Definir o cardápio final", descricao: "Confirme restrições alimentares com o buffet.", diasAntes: 60 },
  { titulo: "Cobrar a confirmação dos convidados", descricao: "Quem ainda não respondeu recebe um lembrete.", diasAntes: 30 },
  { titulo: "Montar o mapa de mesas", descricao: "Use a tela de Mesas do painel.", diasAntes: 21 },
  { titulo: "Confirmar todos os fornecedores", descricao: "Horários, endereços e contatos do dia.", diasAntes: 14 },
  { titulo: "Prova final do traje", descricao: "Última conferência de ajustes.", diasAntes: 14 },
  { titulo: "Pagar saldos pendentes", descricao: "Veja os vencimentos na tela de Custos.", diasAntes: 7 },
  { titulo: "Preparar o kit do dia", descricao: "Alianças, documentos, itens de emergência.", diasAntes: 7 },
  { titulo: "Ensaio da cerimônia", descricao: "Com padrinhos, pajens e cerimonialista.", diasAntes: 3 },
  { titulo: "Enviar agradecimentos", descricao: "Uma mensagem para quem esteve com vocês.", diasAntes: -14 },
];

export type TarefaSugerida = {
  titulo: string;
  descricao: string;
  prazo: string;
};

/**
 * Calcula o prazo de cada tarefa a partir da data do casamento. Prazos que
 * já passaram (casamento próximo) viram "hoje" para não nascerem atrasados.
 */
export function sugerirTarefas(
  dataCasamento: string,
  hoje: string
): TarefaSugerida[] {
  return MODELO.map((m) => {
    let prazo = somarDias(dataCasamento, -m.diasAntes);
    if (m.diasAntes >= 0 && diasEntre(hoje, prazo) < 0) prazo = hoje;
    return { titulo: m.titulo, descricao: m.descricao, prazo };
  });
}
