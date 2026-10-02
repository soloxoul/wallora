import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script"; // ✅ import this

export const metadata: Metadata = {
  title: "Wallora | Transform Your Walls",
  description:
    "Wallora creates beautiful, personalized spaces through modern painting and wall decoration services.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {/* ✅ AdSense Script add here */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5461636835860307"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}