import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import ProductItem from "../productitem/ProductItem";
import ApiContext from "../baseapi/BaseApi";
import { FaLuggageCart } from "react-icons/fa";
import lineimg from "../../assets/icons/star.jpg";
import { MdArrowRightAlt } from "react-icons/md";

const BestSell = () => {
  const [productList, setProductList] = useState([]);
  const [isNavigationVisible, setIsNavigationVisible] = useState(false);
  const navigate = useNavigate();
  const baseApi = useContext(ApiContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await axios.get(`${baseApi}/varient`);

        const fetchedProducts = data?.data?.data?.doc; // Adjust according to API response structure

        // Remove duplicates based on product ID
        const uniqueProducts = [];
        const seenProductIds = new Set();
        fetchedProducts.forEach((item) => {
          if (
            !seenProductIds.has(item?.product?._id) &&
            item?.product?.isBundle == false
          ) {
            seenProductIds.add(item?.product?._id);
            uniqueProducts.push(item);
          }
        });

        // Sort by sellNumber descending (highest sales first)
        uniqueProducts.sort((a, b) => {
          const sellA = a?.product?.sellNumber || a?.sellNumber || 0;
          const sellB = b?.product?.sellNumber || b?.sellNumber || 0;
          return sellB - sellA;
        });

        // Limit to top 10 best selling products
        const top10BestSellers = uniqueProducts.slice(0, 10);

        setProductList(top10BestSellers);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Check if navigation buttons should be visible
    const checkNavigationVisibility = () => {
      const totalSlides = productList.length;
      const currentBreakpoint = window.innerWidth;

      if (
        (currentBreakpoint >= 370 && totalSlides > 2) ||
        (currentBreakpoint >= 640 && totalSlides > 2) ||
        (currentBreakpoint >= 768 && totalSlides > 3) ||
        (currentBreakpoint >= 1024 && totalSlides > 4) ||
        (currentBreakpoint >= 1278 && totalSlides > 5)
      ) {
        setIsNavigationVisible(true);
      } else {
        setIsNavigationVisible(false);
      }
    };

    checkNavigationVisibility();
    window.addEventListener("resize", checkNavigationVisibility);

    return () => {
      window.removeEventListener("resize", checkNavigationVisibility);
    };
  }, [productList]);

  return productList.length > 0 ? ( // Conditionally render if products are available
    <section className="pt-14 font-inter px-3 2xl:px-0">
      <section className="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
        <div>
          <div className="flex flex-wrap justify-between items-center border-b pb-3">
            <div className="px-2 flex justify-center w-full">
              <div>
                <p className="flex justify-center items-center gap-2 text-secendary text-sm">
                  <FaLuggageCart className="bg-secendary font-bold text-2xl p-1 rounded-full text-white" />
                  This Month
                </p>
                <h3 className="lg:text-xl text-[18px] xl:text-[24px] font-bold text-texthead mt-1 text-center">
                  Best Selling
                </h3>
                <img src={lineimg} alt="" className="w-28 mx-auto" />
              </div>
            </div>
          </div>
          <div className="mt-12 w-full relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={1}
              loop={true}
              speed={1000}
              autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
              navigation={{
                nextEl: ".best-sell-next",
                prevEl: ".best-sell-prev",
              }}
              breakpoints={{
                370: { slidesPerView: 2 },
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1278: { slidesPerView: 5 },
              }}
              className="mySwiper w-full group-edit"
            >
              {productList?.map((item, index) => (
                <SwiperSlide key={index}>
                  <ProductItem
                    key={item?._id}
                    product={item?.product}
                    image={item?.product?.photos}
                    id={item?.product?._id}
                    subtitle={item?.brand?.title}
                    title={item?.product?.name}
                    categoryId={item?.category?._id}
                    brandId={item?.brand?._id}
                    brandName={item?.brand?.title}
                    categoryName={item?.category?.title}
                    discount={item?.options[0]?.discountValue}
                    discountType={item?.options[0]?.discountType}
                    discountPercent={item?.discountPercent}
                    priceAfterDiscount={item?.options[0]?.salePrice}
                    offerprice={
                      item?.options[0]?.price - item?.options[0]?.discountValue
                    }
                    freeShipping={item?.options[0]?.freeShipping}
                    regularprice={item?.options[0]?.price}
                    classItem="w-full "
                    achieveSizes={item?.options}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <div
              className={`best-sell-next z-20 absolute rounded-full right-1 -top-20 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 border bg-white 
            hover:bg-primary transition-all ease-linear hover:text-white cursor-pointer hover:border-primary border-[#b6b5b2] justify-center items-center text-[#858380] ${
              isNavigationVisible ? "flex" : "hidden"
            }`}
            >
              <FaChevronRight className="text-xs" />
            </div>
            <div
              className={`best-sell-prev absolute z-20 rounded-full right-10 lg:right-14 -top-20 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 border bg-white 
            hover:bg-primary transition-all ease-linear hover:text-white cursor-pointer hover:border-primary border-[#b6b5b2] justify-center items-center text-[#858380] ${
              isNavigationVisible ? "flex" : "hidden"
            }`}
            >
              <FaChevronLeft className="text-xs" />
            </div>
          </div>
          <div className="flex justify-center">
            <p
              onClick={() => navigate("/shop/mega-sale")}
              className="mt-12 px-5 py-1 hover:opacity-60 cursor-pointer font-medium text-base rounded-md bg-gray-400 text-white transition-all ease-linear duration-200 flex items-center gap-2"
            >
              Show All Products
              <MdArrowRightAlt />
            </p>
          </div>
        </div>
      </section>
    </section>
  ) : (
    <section className="py-14 lg:pt-28 font-inter px-3 2xl:px-0 bg-[#F6F6F7] text-center">
      <p className="text-xl text-gray-500"></p>
    </section>
  );
};

export default BestSell;
