import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VinSwipe",
  description: "Trouve des produits Stokomani à revendre sur Vinted",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#09b44d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
