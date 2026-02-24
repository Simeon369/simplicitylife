import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthBootstrap from "@/components/auth/AuthBootstrap";

const inter = Inter({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://simplicityblog.com";

export const metadata: Metadata = {
  title: "Simplicity Life Blog",
  description: "Order in a chaotic world",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "SIMPLICITY",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&family=Zen+Dots&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <AuthBootstrap />
        {children}
      </body>
    </html>
  );
}
