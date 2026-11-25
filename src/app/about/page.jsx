import About from "@/components/About";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schemas";
import CTAAreaTwo from "@/components/CTAAreaTwo";
import FooterArea from "@/components/FooterArea";
import Header from "@/components/Header";
import ProcessArea from "@/components/ProcessArea";
import SubscribeTwo from "@/components/SubscribeTwo";
import Testimonials from "@/components/Testimonials";
import Preloader from "@/helper/Preloader";

export const metadata = {
  title: "About Us | RapidFix - Auto & Diesel Repair Specialists",
  description:
    "Learn about RapidFix � certified auto and diesel repair technicians with 15+ years of experience and 5,000+ vehicles serviced. We deliver fast, accurate, and affordable service for personal vehicles and commercial fleets.",
  alternates: { canonical: "/about/" },
  openGraph: { title: "About Us | RapidFix - Auto & Diesel Repair Specialists", description: "Learn about RapidFix. Certified auto and diesel repair technicians serving Scarborough drivers.", url: "/about/" },
  twitter: { card: "summary_large_image", title: "About Us | RapidFix - Auto & Diesel Repair Specialists", description: "Learn about RapidFix. Certified auto and diesel repair technicians serving Scarborough drivers." },
};


const page = () => {
  return (
    <>
      {/* Preloader */}
  <Preloader />

      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <Breadcrumb title={"About Us"} style={{borderRadius: "100px"}} img="/assets/img/about/about-us.jpeg"/>
      <JsonLd data={breadcrumbSchema([{ name: "About Us", url: "/about/" }])} />

      {/* About */}
      <About />

      {/* Process Area */}
      <ProcessArea />

      {/* CTA Area Two */}
      <CTAAreaTwo />

      {/* Testimonials */}
      <Testimonials />

      {/* Subscribe Two */}
      <SubscribeTwo />

      {/* Footer Area */}
      <FooterArea />
    </>
  );
};

export default page;

