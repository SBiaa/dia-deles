import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { RastreadorVisita } from "@/components/analytics/RastreadorVisita";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hera — o site do casamento de vocês",
    template: "%s · Hera",
  },
  description:
    "Conte a história de vocês, receba confirmações e presentes. O site do casamento, pronto em minutos.",
  openGraph: {
    siteName: "Hera",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        <RastreadorVisita />
      </body>
    </html>
  );
}
