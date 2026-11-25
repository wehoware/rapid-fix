"use client";
import TrackVisibility from "react-on-screen";
import CountUp from "react-countup";
import Image from "next/image";
const About = () => {
  return (
    <div className="space-top">
      <div className="container">
        <div className="row">
          <div className="col-xxl-7 col-xl-6" data-aos="fade-right" data-aos-duration="900">
            <div className="about-thumb2 mb-40 mb-xl-0">
              <div className="about-img-1">
                <Image src="/assets/img/about/about-15.jpeg" width={942} height={630} alt="RapidFix" />
              </div>
              <div className="about-img-2">
                <Image src="/assets/img/about/about-16.jpg" width={507} height={277} alt="RapidFix" />
              </div>
              <div className="about-counter-wrap jump-reverse">
                <Image src="/assets/img/icon/about_icon2-1.svg" width={65} height={39} alt="RapidFix" />
                <h3 className="about-counter">
                  <TrackVisibility once>
                    {({ isVisible }) =>
                      isVisible && (
                        <span className="counter-number">
                          <CountUp delay={0} start={0} end={500} />
                          +
                        </span>
                      )
                    }
                  </TrackVisibility>
                </h3>
                <h4 className="about-counter-text">Happy Customers</h4>
              </div>
              <div className="about-year-wrap2 movingX">
                <div className="about-year-grid-wrap">
                  <div className="icon">
                    <Image src="/assets/img/icon/about_icon2-2.png" width={28} height={28} alt="RapidFix" />
                  </div>
                  <h3 className="about-counter">
                    <TrackVisibility once>
                      {({ isVisible }) =>
                        isVisible && (
                          <span className="counter-number">
                            <CountUp delay={0} start={0} end={8} />+
                          </span>
                        )
                      }
                    </TrackVisibility>
                  </h3>
                </div>
                <h4 className="about-year-text">Certified Technicians</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl-5 col-xl-6" data-aos="fade-left" data-aos-duration="900" data-aos-delay="150">
            <div className="about-content-wrap">
              <div className="title-area mb-30">
                <span className="sub-title" data-aos="fade-up" data-aos-delay="200">About Us</span>
                <h2 className="sec-title" data-aos="fade-up" data-aos-delay="250">
                  Your Local Auto & Diesel Repair Shop{" "}
                  <Image className="title-bg-shape shape-center" src="/assets/img/bg/title-bg-shape.png" width={485} height={93} alt="RapidFix" />
                </h2>
                <p className="sec-text" data-aos="fade-up" data-aos-delay="300">
                  RapidFix is a Scarborough auto and diesel repair shop run by
                  certified technicians. We service cars, trucks, and commercial
                  fleets with straightforward advice and repairs done right the
                  first time.
                </p>
              </div>
              <div className="about-feature-wrap style-shadow" data-aos="fade-up" data-aos-delay="350">
                <div className="icon">
                  <Image src="/assets/img/icon/about_icon2-3.svg" width={65} height={65} alt="RapidFix" />
                </div>
                <div className="about-feature-wrap-details">
                  <h5 className="about-feature-title">
                    Certified Expert Technicians
                  </h5>
                  <p className="about-feature-text">
                    Our certified team handles everything from routine
                    maintenance to complex diesel overhauls with precision.
                  </p>
                </div>
              </div>
              <div className="about-feature-wrap style-shadow" data-aos="fade-up" data-aos-delay="450">
                <div className="icon">
                  <Image src="/assets/img/icon/about_icon2-4.svg" width={65} height={65} alt="RapidFix" />
                </div>
                <div className="about-feature-wrap-details">
                  <h5 className="about-feature-title">Advanced Diagnostics & Fleet Service</h5>
                  <p className="about-feature-text">
                    State-of-the-art technology and scheduled maintenance plans
                    keep personal vehicles and commercial fleets road-ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
