import "server-only";
import QRCode from "qrcode";

/** SVG do QR code, no tamanho do contêiner e na cor do texto da marca. */
export async function gerarQrSvg(conteudo: string): Promise<string> {
  return QRCode.toString(conteudo, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#14262d", light: "#ffffff" },
  });
}
