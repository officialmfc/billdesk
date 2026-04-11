import "./globals.css";

import type { Metadata, Viewport } from "next";
import { UserAppProvider } from "@/components/providers/user-app-provider";

const USER_WEB_BASE_URL =
  process.env.NEXT_PUBLIC_USER_WEB_URL?.trim().replace(/\/+$/, "") ||
  "https://user.bill.mondalfishcenter.com";

export const metadata: Metadata = {
  title: "MFC User",
  description: "Bills, history, seller, settings, and bill detail for MFC users.",
  metadataBase: new URL(USER_WEB_BASE_URL),
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UserAppProvider>{children}</UserAppProvider>
      </body>
    </html>
  );
}
