import Breadcrumb from "@/components/Breadcrumb";
import FooterArea from "@/components/FooterArea";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schemas";
import Header from "@/components/Header";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import Subscribe from "@/components/Subscribe";
import Preloader from "@/helper/Preloader";

export const metadata = {
  title: "Request a Quote | RapidFix - 112 Sinnott Rd, Scarborough",
  description:
    "Request a quote from RapidFix in Scarborough. Auto repair, diesel repair, diagnostics, maintenance and fleet services. We confirm every request by phone or email.",
  alternates: { canonical: "/request/" },
  openGraph: { title: "Request a Quote | RapidFix - 112 Sinnott Rd, Scarborough", description: "Request a quote for auto repair, diesel repair, diagnostics, maintenance and fleet services.", url: "/request/" },
  twitter: { card: "summary_large_image", title: "Request a Quote | RapidFix - 112 Sinnott Rd, Scarborough", description: "Request a quote for auto repair, diesel repair, diagnostics, maintenance and fleet services." },
};

const page = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <Breadcrumb title={"Request a Quote"} img="/assets/img/contact/contact-us.jpg" />
      <JsonLd data={breadcrumbSchema([{ name: "Request a Quote", url: "/request/" }])} />

      {/* Request form */}
      <div className="space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              <div className="title-area text-center" data-aos="fade-up">
                <span className="sub-title">Fast &amp; Free</span>
                <h2 className="sec-title">Request a Quote</h2>
                <p>
                  Tell us what you need in two quick steps. Prefer to talk? Call{" "}
                  <a href="tel:4378364848">(437) 836-4848</a> — we&apos;re open Mon–Fri, 8 AM–6 PM.
                </p>
              </div>
              <div className="contact-form-wrap" data-aos="fade-up" data-aos-delay="100">
                <ServiceRequestForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribe */}
      <Subscribe />

      {/* Footer Area */}
      <FooterArea />
    </>
  );
};

export default page;
