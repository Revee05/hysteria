import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LayoutClient from "../components/layout/LayoutClient";
import { Poppins } from "next/font/google";
import { getPublicWebsiteInfo } from "../modules/admin/websiteInfo/index.js";
import { withWebsiteInfoDefaults } from "../lib/defaults/website-info.js";

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

export async function generateMetadata() {
  const info = withWebsiteInfoDefaults(await getPublicWebsiteInfo());

  return {
    metadataBase: new URL("https://hysteria.id"),
    title: {
      default: info.judul,
      template: `%s - ${info.judul}`,
    },
    description: info.deskripsi,
    icons: {
      apple: { url: info.logoWebsite },
      shortcut: info.faviconWebsite,
      icon: info.faviconWebsite,
    },
    openGraph: {
      siteName: info.judul,
      locale: "id_ID",
      type: "website",
      images: [
        { url: info.logoWebsite, width: 800, height: 600, alt: info.judul },
      ],
      description: info.deskripsi,
    },
  };
}

export default async function RootLayout({ children }) {
  const websiteInfo = withWebsiteInfoDefaults(await getPublicWebsiteInfo());

  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen flex flex-col font-sans">
        <Providers>
          <LayoutClient websiteInfo={websiteInfo}>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
