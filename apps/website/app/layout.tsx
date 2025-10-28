import type { Metadata } from "next";
import "./globals.css";
import KBarProvider from "@/components/KBarProvider";

export const metadata: Metadata = {
  title: "Noti - Personal Note-Taking with Git Integration",
  description: "A powerful personal note-taking system with Git integration, markdown support, and cross-platform availability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <KBarProvider>{children}</KBarProvider>
      </body>
    </html>
  );
}
