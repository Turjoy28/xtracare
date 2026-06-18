import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import Containar from "../../layouts/Containar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useInView, motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import ApiContext from "../baseapi/BaseApi";
import { PiShootingStarFill } from "react-icons/pi";
import lineimg from "../../assets/icons/star.jpg";

const Brand = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const animation = useAnimation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseApi = useContext(ApiContext);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    // Fetch brand data
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApi}/brand`);
        setData(response.data?.data.doc || []);
      } catch (error) {
        setError("Failed to fetch brand data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseApi]);

  useEffect(() => {
    // Animate on scroll into view
    if (inView) {
      animation.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1, delay: 0.3, ease: "easeIn" },
      });
    }
  }, [inView, animation]);

  useEffect(() => {
    // Show navigation buttons based on data length and screen size
    const updateNavigationVisibility = () => {
      const width = window.innerWidth;
      if (
        (width >= 1280 && data.length > 6) ||
        (width >= 1024 && width < 1280 && data.length > 5) ||
        (width >= 768 && width < 1024 && data.length > 5) ||
        (width >= 640 && width < 768 && data.length > 4) ||
        (width >= 370 && width < 640 && data.length > 2)
      ) {
        setShowNavigation(true);
      } else {
        setShowNavigation(false);
      }
    };

    updateNavigationVisibility();
    window.addEventListener("resize", updateNavigationVisibility);

    return () => {
      window.removeEventListener("resize", updateNavigationVisibility);
    };
  }, [data]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    data.length > 0 && (
      <section ref={ref} className="py-14 lg:py-14 overflow-hidden">
        <section className="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
          <div className="px-5 2xl:px-0 flex items-center justify-center flex-col border-b pb-2">
            <p className="flex items-center justify-center gap-2 text-secendary text-sm">
              <PiShootingStarFill className="bg-secendary font-bold text-2xl p-1 rounded-full text-white" />
              This Month
            </p>
            <h3 className="lg:text-xl text-[18px] xl:text-[24px] font-bold text-texthead mt-1">
              Popular Brands
            </h3>
            <img src={lineimg} alt="" />
          </div>
          <motion.div className="mt-10 relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={1}
              loop={true}
              speed={1000}
              autoplay={{ delay: 1000, pauseOnMouseEnter: true }}
              pagination={{ clickable: true }}
              navigation={{
                nextEl: ".brand-swiper-next",
                prevEl: ".brand-swiper-prev",
              }}
              breakpoints={{
                370: { slidesPerView: 3 },
                640: { slidesPerView: 3 },
                768: { slidesPerView: 6 },
                1024: { slidesPerView: 8 },
                1280: { slidesPerView: 10 },
              }}
              className="mySwiper"
            >
              {data.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="mx-5">
                    <Link
                      className="flex justify-center items-center"
                      to={`/shop/brand/${item?._id}/${item?.title}`}
                    >
                      <img
                        className="w-28 h-28 object-cover shadow"
                        alt="brand"
                        src={item?.photo}
                      />
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className={`rounded-full brand-swiper-next absolute right-0 z-20 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] justify-center items-center text-[#858380] ${showNavigation ? "flex" : "hidden"}`}>
              <FaChevronRight className="text-xs" />
            </div>
            <div className={`rounded-full brand-swiper-prev absolute left-0 z-20 top-1/2 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] justify-center items-center text-[#858380] ${showNavigation ? "flex" : "hidden"}`}>
              <FaChevronLeft className="text-xs" />
            </div>
          </motion.div>
        </section>
      </section>
    )
  );
};

export default Brand;
