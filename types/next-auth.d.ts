import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      casamentoId: string;
      slug: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    casamentoId: string;
    slug: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    usuarioId?: string;
    casamentoId?: string;
    slug?: string;
  }
}
