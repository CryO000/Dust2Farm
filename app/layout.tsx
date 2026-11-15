import type { Metadata } from "next";
import "./globals.css";
import "./platform.css";

export const metadata: Metadata = {
  title: "Dust2Farm — Field intelligence",
  description:
    "From Earth observation to smarter agriculture. A clear view of your field, soil, and next best action.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
