import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BucketsAi · Dashboard del contratista",
  description: "Front office con AI para contratistas de home services.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
