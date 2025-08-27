import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "KUMA Thailand Report by BBY",
  description: "Dashboard kuma thailand by BBYMedia",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
