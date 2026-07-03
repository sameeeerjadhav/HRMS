import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRMS Portal",
  description: "Manage your workforce with confidence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/fonts.css" />
        <link rel="stylesheet" href="/assets/style.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
