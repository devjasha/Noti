import type { Metadata } from "next";
import "./globals.css";
import KBarProvider from "@/components/KBarProvider";

export const metadata: Metadata = {
  title: "Noti - Personal Note-Taking with Git Integration",
  description: "A powerful personal note-taking system with Git integration, markdown support, and cross-platform availability.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Noti - Personal Note-Taking with Git Integration',
    description: 'A powerful personal note-taking system with Git integration, markdown support, and cross-platform availability.',
    images: ['/favicon-512x512.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Noti - Personal Note-Taking with Git Integration',
    description: 'A powerful personal note-taking system with Git integration, markdown support, and cross-platform availability.',
    images: ['/favicon-512x512.png'],
  },
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
