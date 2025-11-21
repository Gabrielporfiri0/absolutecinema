import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Absolute Cinema",
  description: "Reserve seu lugar agora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
