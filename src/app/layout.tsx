import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Hablate Bien",
  description: "Tu coach de autocompasión — transforma tu voz crítica en compasión.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hablate Bien",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon:  "/icons/icon-192.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FDFBF7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
