import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { buscarUsuarioPorEmail } from "./db/queries/usuarios";
import { buscarCasamentoPorUsuarioId } from "./db/queries/casamentos";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : undefined;
        const senha =
          typeof credentials?.senha === "string" ? credentials.senha : undefined;
        if (!email || !senha) return null;

        const usuario = await buscarUsuarioPorEmail(email);
        if (!usuario) return null;

        const ok = await bcrypt.compare(senha, usuario.senha_hash);
        if (!ok) return null;

        const casamento = await buscarCasamentoPorUsuarioId(usuario.id);
        if (!casamento) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          casamentoId: casamento.id,
          slug: casamento.slug,
        };
      },
    }),
  ],
});
