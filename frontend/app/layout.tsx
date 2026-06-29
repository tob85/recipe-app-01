import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipe App",
  description: "Samla och använd dina favoritrecept",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
