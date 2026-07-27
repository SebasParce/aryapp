import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arya · Dashboard del contratista",
  description: "Front office con AI para contratistas de home services.",
  icons: {
    icon: "/icon-arya.png",
    apple: "/icon-arya.png",
  },
};

export const viewport = {
  themeColor: "#0E9B8E",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
