import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import WorkspaceShell from "../components/WorkspaceShell";
import "./design-tokens.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const landingSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "JobPing",
  description: "Real-time alerts for jobs from 3,000+ companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${landingSans.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="jobping-theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("jobping-theme");if(t!=="light"&&t!=="dark")t="light";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})()`,
          }}
        />
      </head>
      <body className="jp-app min-h-full font-sans antialiased">
        <WorkspaceShell>{children}</WorkspaceShell>
      </body>
    </html>
  );
}

