import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthBootstrap from "@/components/auth/AuthBootstrap";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simplicity Life Blog",
  description: "Order in a chaotic world",
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
