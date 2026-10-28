import type { StatusChamado } from "@/lib/db/queries/suporte";
import { COR_STATUS, ROTULO_STATUS } from "@/lib/suporte";

export function EtiquetaStatus({ status }: { status: StatusChamado }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${COR_STATUS[status]}`}
    >
      {ROTULO_STATUS[status]}
    </span>
  );
}
