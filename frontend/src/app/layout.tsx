import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { PwaInstallPrompt } from "@/features/pwa/components/PwaInstallPrompt";
import { InAppPushNotification } from "@/features/notifications/components/InAppPushNotification";
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Maia",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  keywords: ["Maia", "puerpério", "maternidade", "saúde emocional", "acolhimento", "pós-parto"],
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
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-background text-text">
        {children}
        <InAppPushNotification />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
