import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Maia",
    template: "%s | Maia",
  },
  description: "Onde seus sentimentos encontram acolhimento.",
  applicationName: "Maia",
  authors: [{ name: "Maia" }],
  creator: "Maia",
  keywords: [
    "Maia",
    "puerpério",
    "maternidade",
    "saúde emocional",
    "acolhimento",
    "pós-parto",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F48BA4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background text-text">
        {children}
      </body>
    </html>
  );
}