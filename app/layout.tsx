import type { Metadata, Viewport } from "next";
import { Luckiest_Guy, Barlow_Condensed, Black_Ops_One } from "next/font/google";
import "./globals.css";

const luckiestGuy = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const blackOpsOne = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-badge",
});

export const metadata: Metadata = {
  title: "HOOD CERVES",
  description: "Marcador grupal de litros de cerveza",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hood Cerves",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#17181a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${luckiestGuy.variable} ${barlow.variable} ${blackOpsOne.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
