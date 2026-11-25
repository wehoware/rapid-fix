"use client";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Thumbs, EffectFade, Autoplay } from "swiper/modules";
import Image from "next/image";

const HeroThree = () => {
  return (
    <div className="hero-wrapper hero-3">
      <div className="hero-3-slider global-carousel">
        <Swiper
          loop={true}
          modules={[FreeMode, Navigation, Thumbs, EffectFade, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          effect="fade"
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
        >
          <SwiperSlide>
            <div
              className="hero-slide"
              style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                height: "100vh",
                maxHeight: "800px",
              }}
            >
              <Image src="/assets/img/hero/banner8.jpeg" width={1376} height={768} alt="RapidFix" priority style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  zIndex: 0,
                }} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to right, rgba(23,23,23,0.85), rgba(23,23,23,0) 70%)",
                  zIndex: 1,
                }}
              />
              <div className="container" style={{ position: "relative", zIndex: 2 }}>
                <div className="row">
                  <div className="col-xxl-6 col-xl-5 col-lg-6">
                    <div className="hero-style3">
                      <div
                        className="hero-subtitle text-white"
                        data-ani="slideinup"
                        data-ani-delay="0s"
                      >
                        <span>
                          <Image src="/assets/img/hero/hero_shape_3.png" width={200} height={60} alt="RapidFix" />
                          Fleet & Diesel Specialists
                        </span>{" "}
                      </div>
                      <h1
                        className="hero-title text-white"
                        data-ani="slideinup"
                        data-ani-delay="0.1s"
                      >
                        Keeping Your Fleet on the Road.
                      </h1>
                      <p
                        className="hero-text text-white"
                        data-ani="slideinup"
                        data-ani-delay="0.2s"
                      >
                        Fleet maintenance and diesel repair for Scarborough businesses. Fast turnaround that keeps your vehicles working.
                      </p>
                      <div
                        className="btn-group"
                        data-ani="slideinup"
                        data-ani-delay="0.3s"
                      >
                        <Link href="/about" className="btn">
                          Learn More
                        </Link>
                        <div className="call-media-wrap">
                          <div className="icon">
                            <Image src="/assets/img/icon/phone-1.svg" width={25} height={25} alt="RapidFix" />
                          </div>
                          <div className="media-body">
                            <h6 className="title text-white">
                              Call us now:
                            </h6>
                            <h4 className="link">
                              <a className="text-white" href="tel:+14378364848">
                                (437) 836-4848
                              </a>
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="hero-slide"
              style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                height: "100vh",
                maxHeight: "800px",
              }}
            >
              <Image src="/assets/img/hero/banner9.jpeg" width={1376} height={768} alt="RapidFix" priority style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  zIndex: 0,
                }} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to right, rgba(23,23,23,0.85), rgba(23,23,23,0) 70%)",
                  zIndex: 1,
                }}
              />
              <div className="container" style={{ position: "relative", zIndex: 2 }}>
                <div className="row">
                  <div className="col-xxl-6 col-xl-5 col-lg-6">
                    <div className="hero-style3">
                      <div
                        className="hero-subtitle text-white"
                        data-ani="slideinup"
                        data-ani-delay="0s"
                      >
                        <span>
                          <Image src="/assets/img/hero/hero_shape_3.png" width={200} height={60} alt="RapidFix" />
                          Complete Car Care Experts
                        </span>{" "}
                      </div>
                      <h2
                        className="hero-title text-white"
                        data-ani="slideinup"
                        data-ani-delay="0.1s"
                      >
                        Drive In. Drive Out Confident.
                      </h2>
                      <p
                        className="hero-text text-white"
                        data-ani="slideinup"
                        data-ani-delay="0.2s"
                      >
                        Engine work, transmission service, tires, brakes, and everything in between. Book a visit and we'll get it sorted.
                      </p>
                      <div
                        className="btn-group"
                        data-ani="slideinup"
                        data-ani-delay="0.3s"
                      >
                        <Link href="/about" className="btn">
                          Learn More
                        </Link>
                        <div className="call-media-wrap">
                          <div className="icon">
                            <Image src="/assets/img/icon/phone-1.svg" width={25} height={25} alt="RapidFix" />
                          </div>
                          <div className="media-body">
                            <h6 className="title text-white">
                              Call us now:
                            </h6>
                            <h4 className="link">
                              <a className="text-white" href="tel:+14378364848">
                                (437) 836-4848
                              </a>
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default HeroThree;
