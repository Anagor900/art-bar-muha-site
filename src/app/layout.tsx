import type { Metadata } from "next";
import meta from "../../content/site-meta.json";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(meta.siteUrl),
  title: meta.title,
  description: meta.description,
  icons: {
    icon: meta.logoImage,
    apple: meta.logoImage,
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    type: "website",
    siteName: meta.siteName,
    url: meta.siteUrl,
    images: [
      {
        url: meta.logoImage,
        alt: "Логотип Арт-Ресто-Бара МУХА",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
