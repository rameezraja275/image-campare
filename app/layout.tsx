import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photo Comparator",
  description: "Compare original and enhanced photos side by side",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
