import "server-only";

/** Id do store do Blob deste app, extraído do token (vercel_blob_rw_<id>_<segredo>). */
function storeIdDoApp(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  return token.split("_")[3]?.toLowerCase() || null;
}

/**
 * Só aceita URLs https do store do próprio app e dentro de `prefixoCaminho`.
 * Evita registrar arquivos de outros stores/projetos como se fossem nossos.
 */
export function urlDoBlobDoApp(url: string, prefixoCaminho: string): boolean {
  const storeId = storeIdDoApp();
  if (!storeId) return false;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  return (
    u.protocol === "https:" &&
    u.hostname.toLowerCase() === `${storeId}.public.blob.vercel-storage.com` &&
    decodeURIComponent(u.pathname).startsWith(prefixoCaminho)
  );
}
