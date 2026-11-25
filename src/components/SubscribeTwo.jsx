import Link from "next/link";
import Image from "next/image";


const SubscribeTwo = () => {
  return (
    <div className="container">
      <div
        className="footer-top-1 bg-theme"
        style={{ backgroundImage: "url(/assets/img/bg/footer-top-bg1-1.png)" }}
        data-aos="zoom-in"
        data-aos-duration="800"
      >
        <div className="footer-logo" data-aos="fade-down" data-aos-delay="100">
          <Link href="/">
            <Image style={{ width: "200px" }} src="/assets/logo1.png" width={1429} height={287} alt="RapidFix" />
          </Link>
        </div>
        <div className="call-media-wrap" data-aos="fade-up" data-aos-delay="200">
          <div className="icon">
            <Image src="/assets/img/icon/phone-1.svg" width={25} height={25} alt="RapidFix" />
          </div>
          <div className="media-body">
            <h6 className="title text-white">Call us now:</h6>
            <h4 className="link">
              <a className="text-white" href="tel:+14378364848">
                (437) 836-4848
              </a>
            </h4>
          </div>
        </div>
        <div className="social-btn" data-aos="fade-up" data-aos-delay="300">
          <a href="https://www.instagram.com/p/DaEkC23v6Tq/?igsh=bXc2enk0bnVxcWJm" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscribeTwo;
