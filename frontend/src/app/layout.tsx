import type { Metadata } from "next";
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
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maia",
  description: "Onde seus sentimentos encontram acolhimento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-text text-text">
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#f8f4f5] text-text md:max-w-[768px]">
          {children}
        </div>
      </body>
    </html>
  );
}
