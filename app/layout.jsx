import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LayoutClient from "../components/layout/LayoutClient";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://hysteria.id'),
  title: {
    default: 'Hysteria',
    template: '%s - Hysteria',
  },
  description: 'Hysteria adalah ruang kolektif seni, riset, dan budaya yang berbasis di Semarang.',
  icons: {
    apple: { url: '/svg/Logo-hysteria.svg' }, 
    shortcut: '/svg/Logo-hysteria.svg',
  },
  openGraph: {
    siteName: 'Hysteria',
    locale: 'id_ID',
    type: 'website',
    images: [{ url: '/svg/Logo-hysteria.svg', width: 800, height: 600, alt: 'Hysteria' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen flex flex-col font-sans">
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}

