import "server-only";
import { notFound, redirect } from "next/navigation";
import { ehAdmin } from "./admin";
import { auth } from "./auth";

export async function exigirSessao() {
  const session = await auth();
  if (!session?.user?.casamentoId) {
    redirect("/login");
  }
  return session.user;
}

/** Só deixa passar quem está em ADMIN_EMAILS; qualquer outro vê 404. */
export async function exigirAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!ehAdmin(session.user.email)) {
    notFound();
  }
  return session.user;
}
