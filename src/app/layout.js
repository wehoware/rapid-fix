import Script from "next/script";
import BootstrapInit from "@/helper/BootstrapInit";
import Animation from "@/helper/Animation";
import { ServicesProvider } from "@/context/ServicesContext";
import "./font.css";
import "./globals.scss";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.rapidfixauto.ca"
  ),
  title: "RapidFix - Car Repair & Auto Services",
  description:
    "RapidFix is your trusted auto repair and maintenance shop in Scarborough and Toronto. We specialize in car repairs, diesel services, routine maintenance, diagnostics, fleet servicing, brake repairs, oil changes, and more. Our certified technicians use advanced diagnostics and quality parts to keep your vehicle safe and reliable.",
  icons: {
    icon: "/assets/img/favicons/favicon.png",
    shortcut: "/assets/img/favicons/favicon.png",
    apple: "/assets/img/favicons/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "RapidFix Auto",
    title: "RapidFix - Car Repair & Auto Services",
    description:
      "Trusted auto and diesel repair in Scarborough and Toronto. Brakes, diagnostics, fleet maintenance, SSC inspections and more at 112 Sinnott Rd.",
    url: "/",
    images: [
      {
        url: "/assets/img/contact/contact-1.jpeg",
        width: 1200,
        height: 630,
        alt: "RapidFix Auto - 112 Sinnott Rd, Scarborough",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RapidFix - Car Repair & Auto Services",
    description:
      "Trusted auto and diesel repair in Scarborough and Toronto. Brakes, diagnostics, fleet maintenance, SSC inspections and more.",
    images: ["/assets/img/contact/contact-1.jpeg"],
  },
  verification: {
    google: "M49fU-f9Imxle53tdE-EE0NC8MUt5lcVyd-trwzp6fE",
  },
  other: {
    "geo.region": "CA-ON",
    "geo.placename": "Scarborough",
    "geo.position": "43.7017;-79.2724",
    ICBM: "43.7017, -79.2724",
  },
};

export const viewport = {
  themeColor: "#E03A3A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N763TKFC" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img alt="" height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=2064492734143343&ev=PageView&noscript=1" />`,
          }}
        />
        <Script id="gtm-script" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-N763TKFC');`}
        </Script>
        <Script id="meta-pixel-script" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2064492734143343');fbq('track','PageView');`}
        </Script>
        <BootstrapInit />
        <Animation />
        <ServicesProvider>
          {children}
        </ServicesProvider>
      </body>
    </html>
  );
}
