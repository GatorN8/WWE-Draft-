import "./globals.css";

export const metadata = {
  title: "WWE Fantasy League",
  description: "Live fantasy wrestling league app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WWE Fantasy"
  },
  themeColor: "#111111",
  icons: { apple: "/icons/icon-192.png" }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111111"
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}