// import React, { useContext, useEffect, useState } from "react";
// import axios from "axios";
// import Containar from "../../layouts/Containar";
// import { FaLuggageCart } from "react-icons/fa";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import { Autoplay, Navigation, Pagination } from "swiper/modules";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import ApiContext from "../baseapi/BaseApi";

// const BundlePackages = () => {
//   const [bundles, setBundles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const baseApi = useContext(ApiContext);

//   useEffect(() => {
//     const fetchBundles = async () => {
//       try {
//         const response = await axios.get(`${baseApi}/product`);
//         const filteredBundles = response?.data?.data.allProduct.filter(
//           (item) => item.isBundle
//         );
//         setBundles(filteredBundles);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBundles();
//   }, [baseApi]);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <>
//       {bundles?.length > 0 && (
//         <div className="py-14 lg:py-28 bg-[#F6F7FB] font-inter bestdealweek">
//           <Containar>
//             <div className="px-2 border-b pb-3">
//               <p className="flex items-center gap-2 text-red-500 text-sm">
//                 <FaLuggageCart className="bg-red-500 font-bold text-2xl p-1 rounded-full text-white" />
//                 Bundle
//               </p>
//               <h3 className="text-[24px] mr-3 lg:text-2xl text-texthead font-medium mt-1">
//                 Bundle Packages
//               </h3>
//             </div>
//             <div className="mt-10 bg-white relative">
//               <Swiper
//                 modules={[Navigation, Autoplay, Pagination]}
//                 slidesPerView={1}
//                 speed={1000}
//                 loop={true}
//                 autoplay={{ delay: 2000, pauseOnMouseEnter: true }}
//                 pagination={{
//                   el: ".custom-pagination1",
//                   clickable: true,
//                 }}
//                 navigation={{
//                   nextEl: ".swiper-button-next6",
//                   prevEl: ".swiper-button-prev2",
//                 }}
//                 breakpoints={{
//                   370: {
//                     slidesPerView: 1,
//                   },
//                   1024: {
//                     slidesPerView: 2,
//                   },
//                 }}
//                 className="mySwiper"
//               >
//                 {bundles.map((item) => {
//                   const titlee = item?.name || "Bundle";
//                   const id = item?._id || "";

//                   const slg = titlee
//                     .toLowerCase()
//                     .trim()
//                     .replace(/[^\u0980-\u09FF0-9a-zA-Z\s-]/g, "")
//                     .replace(/\s+/g, "-")
//                     .replace(/-+/g, "-")
//                     .replace(/^-|-$/g, "");

//                   return (
//                     <SwiperSlide key={item?._id}>
//                       <div className="w-full xl:h-[408px] border hover:border-texthead transition-all ease-linear duration-150 border-border hover:drop-shadow-md">
//                         <Link
//                           className="w-full h-full"
//                           to={`/productdetail/${slg}/${id}`}
//                         >
//                           <img
//                             className="w-full h-full"
//                             src={item?.photos[0]}
//                             alt={item?.name || "Bundle Image"}
//                           />
//                         </Link>
//                       </div>
//                     </SwiperSlide>
//                   );
//                 })}
//               </Swiper>
//               <div className="custom-pagination1"></div>
//               <div className="rounded-full swiper-button-next6 absolute z-20 right-1  -top-20 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380]">
//                 <FaChevronRight className="text-xs" />
//               </div>
//               <div className="rounded-full swiper-button-prev2 absolute z-20 right-14  -top-20 -translate-y-1/2 w-10 h-10 border bg-white hover:bg-texthead transition-all ease-linear hover:text-white cursor-pointer hover:border-texthead border-[#b6b5b2] flex justify-center items-center text-[#858380]">
//                 <FaChevronLeft className="text-xs" />
//               </div>
//             </div>
//           </Containar>
//         </div>
//       )}
//     </>
//   );
// };

// export default BundlePackages;

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Containar from "../../layouts/Containar";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import ProductItem from "../productitem/ProductItem";
import ApiContext from "../baseapi/BaseApi";
import { FaLuggageCart } from "react-icons/fa";
import lineimg from "../../assets/icons/star.jpg";
import { MdArrowRightAlt } from "react-icons/md";
import NewProductItem from "../productitem/NewProductItem";

const BundlePackages = () => {
  const [productList, setProductList] = useState([]);
  const [isNavigationVisible, setIsNavigationVisible] = useState(false);
  const navigate = useNavigate();
  const baseApi = useContext(ApiContext);

  //   useEffect(() => {
  //     const fetchProducts = async () => {
  //       try {
  //         const data = await axios.get(`${baseApi}/product`);

  //         const fetchedProducts = data?.data?.data?.allProduct.filter(
  //           (item) => item.isBundle
  //         );
  // console.log("Fetched Products", fetchedProducts)
  //         setProductList(fetchedProducts);
  //       } catch (error) {
  //         console.error("Error fetching products:", error);
  //       }
  //     };

  //     fetchProducts();
  //   }, []);

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
            item?.product?.isBundle == true
          ) {
            seenProductIds.add(item?.product?._id);
            uniqueProducts.push(item);
          }
        });
        console.log("============", uniqueProducts);
        setProductList(uniqueProducts);
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

  // return productList.length > 0 ? (
  //   <section className="py-14 font-inter px-3 2xl:px-0">
  //     <section className="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
  //       <div>
  //         <div className="flex flex-wrap justify-between items-center border-b pb-3">
  //           <div className="px-2 flex justify-center w-full">
  //             <div>
  //               <p className="flex justify-center items-center gap-2 text-secendary text-sm">
  //                 <FaLuggageCart className="bg-secendary font-bold text-2xl p-1 rounded-full text-white" />
  //                 Bundle
  //               </p>
  //               <h3 className="lg:text-xl text-[18px] xl:text-[24px] font-bold text-texthead mt-1 text-center">
  //                 Bundle Packages
  //               </h3>
  //               <img src={lineimg} alt="" className="w-28 mx-auto" />
  //             </div>
  //           </div>
  //         </div>
  //         <motion.div
  //           initial={{ opacity: 0, y: 100 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           transition={{ delay: 1, duration: 2 }}
  //           className="mt-12 w-full relative"
  //         >
  //           <Swiper
  //             modules={[Navigation, Autoplay]}
  //             slidesPerView={1}
  //             loop={true}
  //             speed={1000}
  //             autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
  //             navigation={{
  //               nextEl: ".swiper-button-next1",
  //               prevEl: ".swiper-button-prev1",
  //             }}
  //             breakpoints={{
  //               370: { slidesPerView: 2 },
  //               640: { slidesPerView: 2 },
  //               768: { slidesPerView: 3 },
  //               1024: { slidesPerView: 4 },
  //               1278: { slidesPerView: 5 },
  //             }}
  //             className="mySwiper w-full group-edit"
  //           >
  //             {productList?.map((item, index) => (
  //               <SwiperSlide key={index}>
  //                 <ProductItem
  //                   key={item?._id}
  //                   product={item}
  //                   image={item?.photos}
  //                   id={item?._id}
  //                   title={item?.name}
  //                   categoryId={item?.category?._id}
  //                   brandId={item?.brand?._id}
  //                   discount={item?.totalPrice - item?.price}
  //                   discountType="amount"
  //                   priceAfterDiscount={item?.price}
  //                   // freeShipping={item?.options[0]?.freeShipping}
  //                   regularprice={item?.totalPrice}
  //                   bundleCheck={item?.isBundle}
  //                   classItem="w-full "
  //                   achieveSizes={item?.options}

  //                   // subtitle={item?.brand?.title}
  //                   // brandName={item?.brand?.title}
  //                   // categoryName={item?.category?.title}
  //                   // discountPercent={item?.discountPercent}
  //                   // offerprice={
  //                   //   item?.options[0]?.price - item?.options[0]?.discountValue
  //                   // }
  //                   // freeShipping={item?.options[0]?.freeShipping}

  //                 />
  //               </SwiperSlide>
  //             ))}
  //           </Swiper>

  //           {isNavigationVisible && (
  //             <>
  //               <motion.div
  //                 className="swiper-button-next1 z-20 absolute rounded-full right-1 -top-20 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 border bg-white
  //               hover:bg-primary transition-all ease-linear hover:text-white cursor-pointer hover:border-primary border-[#b6b5b2] flex justify-center items-center text-[#858380]"
  //               >
  //                 <FaChevronRight className="text-xs" />
  //               </motion.div>
  //               <motion.div
  //                 className="swiper-button-prev1 absolute z-20 rounded-full right-10 lg:right-14 -top-20 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 border bg-white
  //               hover:bg-primary transition-all ease-linear hover:text-white cursor-pointer hover:border-primary border-[#b6b5b2] flex justify-center items-center text-[#858380]"
  //               >
  //                 <FaChevronLeft className="text-xs" />
  //               </motion.div>
  //             </>
  //           )}
  //         </motion.div>
  //         <div className="flex justify-center">
  //           <p
  //             onClick={() => navigate("/shop/mega-sale")}
  //             className="mt-12 px-5 py-1 hover:opacity-60 cursor-pointer font-medium text-base rounded-md bg-gray-400 text-white transition-all ease-linear duration-200 flex items-center gap-2"
  //           >
  //             Show All Products
  //             <MdArrowRightAlt />
  //           </p>
  //         </div>
  //       </div>
  //     </section>
  //   </section>
  // ) : (
  //   // Fallback for when no products are available
  //   <section className="py-14 lg:pt-28 font-inter px-3 2xl:px-0 bg-[#F6F6F7] text-center">
  //     <p className="text-xl text-gray-500"></p>
  //   </section>
  // );








  return productList.length > 0 ? ( // Conditionally render if products are available
    <section className="font-inter px-3 2xl:px-0 mt-12">
      <section className="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
        <div>
          <div className="flex flex-wrap justify-center items-center border-b pb-3">
            <div className="flex flex-wrap justify-between items-center">
              <div className="px-2 flex justify-center w-full">
                <div>
                  <p className="flex justify-center items-center gap-2 text-secendary text-sm">
                    <FaLuggageCart className="bg-secendary font-bold text-2xl p-1 rounded-full text-white" />
                    Bundle
                  </p>
                  <h3 className="lg:text-xl text-[18px] xl:text-[24px] font-bold text-texthead mt-1 text-center">
                    Bundle Packages
                  </h3>
                  <img src={lineimg} alt="" className="w-28 mx-auto" />
                </div>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 2 }}
            className="mt-12 w-full relative"
          >
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={1}
              loop={true}
              speed={1000}
              autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
              navigation={{
                nextEl: ".swiper-button-next1",
                prevEl: ".swiper-button-prev1",
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
                    discountType={"amount"}
                    discountPercent={item?.discountPercent}
                    priceAfterDiscount={item?.product?.price}
                    offerprice={item?.product?.totalPrice}
                    freeShipping={item?.options[0]?.freeShipping}
                    regularprice={item?.product?.totalPrice}
                    classItem="w-full "
                    achieveSizes={item?.options}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {isNavigationVisible && (
              <>
                <motion.div
                  className="swiper-button-next1 z-20 absolute rounded-full right-1 -top-20 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 border bg-white 
                hover:bg-primary transition-all ease-linear hover:text-white cursor-pointer hover:border-primary border-[#b6b5b2] flex justify-center items-center text-[#858380]"
                >
                  <FaChevronRight className="text-xs" />
                </motion.div>
                <motion.div
                  className="swiper-button-prev1 absolute z-20 rounded-full right-10 lg:right-14 -top-20 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 border bg-white 
                hover:bg-primary transition-all ease-linear hover:text-white cursor-pointer hover:border-primary border-[#b6b5b2] flex justify-center items-center text-[#858380]"
                >
                  <FaChevronLeft className="text-xs" />
                </motion.div>
              </>
            )}
          </motion.div>
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
    // Fallback for when no products are available
    <section className="">
      <p className=""></p>
    </section>
  );
};

export default BundlePackages;
