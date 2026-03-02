import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BridgeOps",
  description: "AI-powered Git and GitHub assistant interface",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌉</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <script>
          {`
            if (typeof window !== 'undefined') {
              mermaid.initialize({ 
                startOnLoad: true,
                theme: 'dark',
                themeVariables: {
                  primaryColor: '#3b82f6',
                  primaryTextColor: '#1f2937',
                  primaryBorderColor: '#60a5fa',
                  lineColor: '#6b7280',
                  backgroundColor: '#ffffff'
                }
              });
            }
          `}
        </script>
      </head>
      <body
        className={`${dmSans.variable} ${geistMono.variable} antialiased dark:bg-background dark:text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
