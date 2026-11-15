import type { Metadata } from "next";
import "./globals.css";
import "./platform.css";

export const metadata: Metadata = {
  title: "Dust2Farm | Farm monitoring",
  description:
    "Farm monitoring for field conditions, sensors, irrigation, and maintenance.",
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
