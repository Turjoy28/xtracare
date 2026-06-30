import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ApiContext from "../baseapi/BaseApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import lineimg from "../../assets/icons/star.jpg";
const Feature = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const navigate = useNavigate();
  const baseApi = useContext(ApiContext);

  // Fetch categories fast
  useEffect(() => {
    const controller = new AbortController(); // To cancel request if needed
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${baseApi}/category`, {
          signal: controller.signal, // Link to abort controller
        });
        setCategories(data?.data?.doc);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("Failed to fetch categories. Please try again.");
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
    return () => controller.abort(); // Cleanup on unmount
  }, [baseApi]);

  // Update navigation visibility
  useEffect(() => {
    const updateNavigationVisibility = () => {
      const width = window.innerWidth;
      setShowNavigation(
        (width >= 1280 && categories.length > 6) ||
        (width >= 1024 && categories.length > 5) ||
        (width >= 768 && categories.length > 5) ||
        (width >= 640 && categories.length > 4) ||
        (width >= 370 && categories.length > 2)
      );
    };

    updateNavigationVisibility();
    window.addEventListener("resize", updateNavigationVisibility);
    return () =>
      window.removeEventListener("resize", updateNavigationVisibility);
  }, [categories]);

  return (
    <section className="pt-12 font-inter px-5 2xl:px-0">
      <section className="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
        <div className="flex flex-wrap justify-between items-center border-b pb-3">
          <div className="px-2 flex justify-center w-full">
            <div>
              <h3 className="lg:text-xl text-[18px] xl:text-[24px] font-bold text-texthead mt-1 text-center">
                All Categories
              </h3>
              <img src={lineimg} alt="" className="w-28 mx-auto" />
            </div>
          </div>
        </div>

        {error ? (
          <section className="pt-14 lg:pt-28 font-inter px-5 2xl:px-0 text-center">
            <p className="text-lg text-red-500">{error}</p>
          </section>
        ) : (
          <motion.div className="my-6 relative flex justify-center">
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={2} // Show 2 categories by default on small mobile screens
              centerInsufficientSlides={true}
              loop={categories?.length > 8}
              speed={1000}
              autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
              pagination={{ clickable: true }}
              navigation={{
                nextEl: ".feature-categories-next",
                prevEl: ".feature-categories-prev",
              }}
              breakpoints={{
                370: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 6 },
                1280: { slidesPerView: 8 },
              }}
              className="mySwiper w-full"
            >
              {categories?.map((item) => (
                <SwiperSlide key={item._id}>
                  <div className="group mx-2">
                    <Link
                      to={`/shop/category/${item._id}/${encodeURIComponent(
                        item.title.replace(/\s+/g, "")
                      )}`}
                      className="w-full"
                    >
                      <img
                        src={item?.photos}
                        alt={item?.name}
                        className="w-full aspect-square object-cover rounded-md"
                      />
                      <div className="flex items-center gap-2 justify-center text-sm font-bold mt-5 pb-2">
                        <span
                          onClick={() =>
                            navigate(
                              `/shop/category/${item._id}/${encodeURIComponent(
                                item.title.replace(/\s+/g, "")
                              )}`
                            )
                          }
                        >
                          {item.title}
                        </span>
                        <FaRegArrowAltCircleRight className="group-hover:text-red-500 duration-200 group-hover:-rotate-45" />
                      </div>
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            <div className={`feature-categories-next absolute right-1 z-20 -top-16 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 border bg-white hover:bg-primary transition-all ease-linear hover:text-white cursor-pointer hover:border-primary border-[#b6b5b2] justify-center items-center text-[#858380] rounded-full ${showNavigation ? "flex" : "hidden"}`}>
              <FaChevronRight className="text-xs" />
            </div>
            <div className={`feature-categories-prev absolute right-10 lg:right-14 z-20 -top-16 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 border bg-white hover:bg-primary transition-all ease-linear hover:text-white cursor-pointer hover:border-primary border-[#b6b5b2] justify-center items-center text-[#858380] rounded-full ${showNavigation ? "flex" : "hidden"}`}>
              <FaChevronLeft className="text-xs" />
            </div>
          </motion.div>
        )}
      </section>
    </section>
  );
};

export default Feature;
