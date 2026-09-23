import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": sem provider nenhum aqui (Credentials com acesso a
// banco vive só em lib/auth.ts). O proxy importa só este arquivo, então
// nunca puxa o driver do banco pro bundle do proxy.
export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const logado = !!auth?.user;
      const precisaLogin = request.nextUrl.pathname.startsWith("/painel");
      if (!precisaLogin) return true;
      return logado;
    },
    jwt({ token, user }) {
      if (user) {
        token.usuarioId = (user as { id: string }).id;
        token.casamentoId = (user as { casamentoId: string }).casamentoId;
        token.slug = (user as { slug: string }).slug;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.usuarioId as string;
        session.user.casamentoId = token.casamentoId as string;
        session.user.slug = token.slug as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
