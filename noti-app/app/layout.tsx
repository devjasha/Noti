import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noti - Personal Note System",
  description: "Take notes anywhere, access them everywhere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
