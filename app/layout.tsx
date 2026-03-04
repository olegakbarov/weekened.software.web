import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weekend Software",
  description: "Software that feels like the weekend."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
