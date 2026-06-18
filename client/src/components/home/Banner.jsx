// import React, { useState, useEffect, useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import { Autoplay, Pagination, EffectFade } from "swiper/modules";
// import "swiper/css/effect-fade";
// import axios from "axios";
// import ApiContext from "../baseapi/BaseApi";

// const Banner = () => {
//   const [bannerList, setBannerList] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const baseApi = useContext(ApiContext);

//   useEffect(() => {
//     const fetchBannerData = async () => {
//       try {
//         const response = await axios.get(`${baseApi}/banner`);
//         const banners = response.data.data.doc.filter(
//           (item) =>
//             item?.bannerType === "Main Banner" ||
//             item?.bannerType === "New Release" ||
//             item?.bannerType === "Deals of the Week"
//         );
//         setBannerList(banners);
//         // setLoading(false);
//       } catch (err) {
//         setError(err);
//         setLoading(false);
//       }
//     };

//     fetchBannerData();
//   }, [baseApi]);

//   const handleSlideChange = (swiper) => {
//     setCurrentSlide(swiper.realIndex);
//   };

//   if (loading)
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-5 pt-5">
//         <section className="relative banner-part col-span-2 animate-pulse">
//           <div className="w-full lg:h-[320px] xl:h-[400px] 2xl:h-[600px] object-fit cursor-pointer rounded-lg bg-[#bd1e2d] opacity-5"></div>
//         </section>
//         <section className="col-span-2 grid grid-cols-2 gap-5 animate-pulse">
//           <div className="relative group col-span-2 bg-[#bd1e2d] opacity-5"></div>
//           <div className="relative group grid grid-cols-2 col-span-2 gap-5 bg-[#bd1e2d] opacity-5"></div>
//         </section>
//       </div>
//     );
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div className="font-inter block lg:px-5 pt-3">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 px-3 lg:px-0">
//         <section className="relative banner-part col-span-2">
//           <Swiper
//             modules={[Autoplay, EffectFade, Pagination]}
//             slidesPerView={1}
//             effect="fade"
//             speed={1000}
//             loop={true}
//             autoplay={{ delay: 2000 }}
//             onSlideChange={handleSlideChange}
//             pagination={{
//               el: ".custom-pagination",
//               clickable: true,
//             }}
//             breakpoints={{
//               640: { slidesPerView: 1 },
//               768: { slidesPerView: 1 },
//               1024: { slidesPerView: 1 },
//             }}
//             className="mySwiper"
//           >
//             {bannerList
//               .filter((item) => item.bannerType === "Main Banner")
//               .map((item, i) => (
//                 <SwiperSlide key={item?._id}>
//                   <div className="">
//                     {currentSlide === i && (
//                       <img
//                         key={i}
//                         className="w-full object-fill lg:h-[320px] xl:h-[397px] 2xl:h-[533px] cursor-pointer "
//                         src={item?.photo}
//                         alt="banner"
//                         onClick={() => navigate(item?.link)}
//                       />
//                     )}
//                   </div>
//                 </SwiperSlide>
//               ))}
//           </Swiper>
//         </section>

//         <section className="col-span-2 grid grid-cols-2 ">
//           <div className="relative group col-span-2 ">
//             {bannerList
//               .filter((item) => item.bannerType === "New Release")
//               .map((banner) => (
//                 <div key={banner._id} className="">
//                   <Link to="/shop">
//                     <img
//                       className="w-full object-fill lg:h-[145px] xl:h-[200px] 2xl:h-[255px] "
//                       src={banner.photo}
//                       alt="New Release"
//                     />
//                   </Link>
//                 </div>
//               ))}
//           </div>

//           <div className="relative group grid grid-cols-2 col-span-2 gap-2 pt-2">
//             {bannerList
//               .filter((item) => item.bannerType === "Deals of the Week")
//               .map((deal) => (
//                 <div key={deal._id}>
//                   <Link to={deal.link || "#"}>
//                     <img
//                       className="w-full object-fill lg:h-[165px] xl:h-[190px] 2xl:h-[270px] "
//                       src={deal.photo}
//                       alt="Deals of the Week"
//                     />
//                   </Link>
//                 </div>
//               ))}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default Banner;
import { useState, useEffect, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css/effect-fade";
import axios from "axios";
import ApiContext from "../baseapi/BaseApi";

const Banner = () => {
  const [banners, setBanners] = useState({
    main: [],
    newReleases: [],
    deals: [],
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState(null);
  const baseApi = useContext(ApiContext);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const { data } = await axios.get(`${baseApi}/banner`);
        const filteredBanners = data?.data?.doc || [];

        setBanners({
          main: filteredBanners?.filter(
            (item) => item?.bannerType === "Main Banner"
          ),
          newReleases: filteredBanners?.filter(
            (item) => item?.bannerType === "New Release"
          ),
          deals: filteredBanners?.filter(
            (item) => item?.bannerType === "Deals of the Week"
          ),
        });
      } catch (err) {
        setError(err);
      }
    };

    fetchBannerData();
  }, [baseApi]);

  const handleSlideChange = (swiper) => setCurrentSlide(swiper?.realIndex);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="font-inter block lg:px-2 pt-3">
      <div className="px-3 lg:px-0">
        {/* Main Banner */}
        <section className="relative banner-part">
          {banners?.main?.length > 0 ? (
            <Swiper
              modules={[Autoplay, EffectFade, Pagination]}
              slidesPerView={1}
              effect="fade"
              speed={1000}
              loop={true}
              autoplay={{ delay: 2000 }}
              onSlideChange={handleSlideChange}
              pagination={{ el: ".custom-pagination", clickable: true }}
              className="mySwiper"
            >
              {banners?.main?.map((item, i) => (
                <SwiperSlide key={item?._id}>
                  <div>
                    {currentSlide === i && (
                      <img
                        className="w-full h-[250px] md:h-[350px] lg:h-[450px] xl:h-[550px] 2xl:h-[750px] rounded-lg"
                        src={item?.photo}
                        alt="banner"
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full h-[250px] md:h-[350px] lg:h-[450px] xl:h-[550px] 2xl:h-[750px] rounded-lg bg-gray-100 animate-pulse"></div>
          )}
        </section>

        {/* Side Banners */}
        <section className="col-span-2 grid grid-cols-2">
          {/* New Release */}
          {/* <div className="relative group col-span-2">
            {banners?.newReleases?.length > 0 ? (
              banners?.newReleases?.map((banner) => (
                <Link key={banner?._id} to="/shop">
                  <img
                    className="w-full object-fill lg:h-[145px] xl:h-[198px] 2xl:h-[255px]"
                    src={banner?.photo}
                    alt="New Release"
                  />
                </Link>
              ))
            ) : (
              <div className="w-full lg:h-[145px] xl:h-[198px] 2xl:h-[255px] bg-gray-100 animate-pulse rounded-md"></div>
            )}
          </div> */}

          {/* Deals of the Week */}
          {/* <div className="relative group grid grid-cols-2 col-span-2 gap-2 pt-2">
            {banners?.deals?.length > 0 ? (
              banners?.deals?.map((deal) => (
                <Link key={deal?._id} to={deal?.link || "#"}>
                  <img
                    className="w-full object-fill lg:h-[165px] xl:h-[188px] 2xl:h-[270px]"
                    src={deal?.photo}
                    alt="Deals of the Week"
                  />
                </Link>
              ))
            ) : (
              <div className="w-full lg:h-[165px] xl:h-[188px] 2xl:h-[270px] bg-gray-100 animate-pulse rounded-md"></div>
            )}
          </div> */}
        </section>
      </div>
    </div>
  );
};

export default Banner;
