import './globals.css';

import type { Metadata, Viewport } from "next";

import { LocalAuthProvider } from "@/components/auth/LocalAuthProvider";
import { AuthProviderWrapper } from "@/components/providers/AuthProviderWrapper";
import { DataAccessProviderWrapper } from "@/components/providers/DataAccessProviderWrapper";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "MFC Manager - Offline-First Sales Management",
  description:
    "MFC Manager - Offline-first sales management system with secure offline access",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MFC Manager",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MFC Manager" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('[SW] Registered:', reg.scope))
                    .catch(err => console.error('[SW] Registration failed:', err));
                });
              }
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ToastProvider>
            <InstallPrompt />
            <AuthProviderWrapper>
              <LocalAuthProvider>
                <DataAccessProviderWrapper>
                  {children}
                </DataAccessProviderWrapper>
              </LocalAuthProvider>
            </AuthProviderWrapper>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
