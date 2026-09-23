import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function exigirSessao() {
  const session = await auth();
  if (!session?.user?.casamentoId) {
    redirect("/login");
  }
  return session.user;
}
