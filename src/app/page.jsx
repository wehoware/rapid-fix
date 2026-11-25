import BlogArea from "@/components/BlogArea";
import ClientArea from "@/components/ClientArea";
import FaqArea from "@/components/FaqArea";
import FooterArea from "@/components/FooterArea";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutHome from "../components/AboutHome.jsx";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import ProductArea from "@/components/ProductArea";
import Preloader from "@/helper/Preloader";
import ServiceArea from "@/components/ServiceArea";
import MarqueeComponent from "@/components/Marquee";
import Subscribe from "@/components/Subscribe.jsx";
import CTAArea from "@/components/CTAArea.jsx";
import Counter from "@/components/Counter.jsx";
import TruckServices from "@/components/TruckServices";

export const metadata = {
  title: "RapidFix | Auto & Diesel Repair in Scarborough, ON",
  description:
    "RapidFix offers expert auto and diesel repair in Scarborough, ON. Brakes, diagnostics, fleet maintenance, and SSC inspections. Fast, honest service at 112 Sinnott Rd.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "RapidFix | Auto & Diesel Repair in Scarborough, ON",
    description:
      "Expert auto and diesel repair in Scarborough, ON. Brakes, diagnostics, fleet maintenance and SSC inspections at 112 Sinnott Rd.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "RapidFix | Auto & Diesel Repair in Scarborough, ON",
    description:
      "Expert auto and diesel repair in Scarborough, ON. Brakes, diagnostics, fleet maintenance and SSC inspections at 112 Sinnott Rd.",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: "RapidFix Auto",
  url: SITE_URL,
  telephone: "+1-437-836-4848",
  email: "Info@rapidfixauto.ca",
  address: {
    "@type": "PostalAddress",
    streetAddress: "112 Sinnott Rd",
    addressLocality: "Scarborough",
    addressRegion: "ON",
    postalCode: "M1L 4S6",
    addressCountry: "CA",
  },
  geo: { "@type": "GeoCoordinates", latitude: 43.7017, longitude: -79.2724 },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
  },
  priceRange: "$$",
  sameAs: ["https://www.instagram.com/p/DaEkC23v6Tq/"],
};

const page = () => {
  return (
    <>
      {/* Local business structured data */}
      <JsonLd data={localBusinessSchema} />

      {/* Preloader */}
      <Preloader />

      {/* Header */}
      <Header />

      {/* Hero */}
      <Hero />

      {/* Counter */}
      <div style={{ marginTop: '150px' }}>
        <Counter />
      </div>


      {/* About Home */}
      <AboutHome />

      {/* Truck Services */}
      <TruckServices />

      {/* Marquee */}
      <MarqueeComponent />

      {/* Service Area */}
      <ServiceArea />

      {/* CTA Area */}
      <div style={{ marginTop: '100px' }}>
        <CTAArea />
      </div>

      {/* Product Area */}
      <ProductArea />

      {/* Blog Area */}
      <BlogArea />

      {/* Client Area */}
      <ClientArea />

      {/* Faq Area */}
      <FaqArea />

      {/* Subscribe */}
      <Subscribe />

      {/* Footer Area */}
      <FooterArea />
    </>
  );
};

export default page;

