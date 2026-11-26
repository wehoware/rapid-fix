import Breadcrumb from "@/components/Breadcrumb";
import ContactArea from "@/components/ContactArea";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schemas";
import FooterArea from "@/components/FooterArea";
import Header from "@/components/Header";
import Subscribe from "@/components/Subscribe";
import Preloader from "@/helper/Preloader";

export const metadata = {
  title: "Contact Us | RapidFix - 112 Sinnott Rd, Scarborough",
  description:
    "Contact RapidFix at 112 Sinnott Rd, Scarborough, ON. Call (437) 836-4848. Open Monday to Friday, 8:00 AM - 6:00 PM. Book your auto or diesel repair service today.",
  alternates: { canonical: "/contact/" },
  openGraph: { title: "Contact Us | RapidFix - 112 Sinnott Rd, Scarborough", description: "Call (437) 836-4848 or visit 112 Sinnott Rd, Scarborough, ON. Open Mon-Fri 8AM-6PM.", url: "/contact/" },
  twitter: { card: "summary_large_image", title: "Contact Us | RapidFix - 112 Sinnott Rd, Scarborough", description: "Call (437) 836-4848 or visit 112 Sinnott Rd, Scarborough, ON. Open Mon-Fri 8AM-6PM." },
};


const page = () => {
  return (
    <>
      {/* Preloader */}
  <Preloader />

       {/* Header */}
       <Header />

{/* Breadcrumb */}
<Breadcrumb title={"Contact-Us"} img="/assets/img/contact/contact-us.jpg"/>
      <JsonLd data={breadcrumbSchema([{ name: "Contact Us", url: "/contact/" }])} />

   {/* Contact Area */}
   <ContactArea />

{/* Subscribe */}
<Subscribe />

{/* Footer Area */}
<FooterArea />
    </>
  );
};

export default page;

