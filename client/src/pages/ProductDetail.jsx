import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Autoplay, FreeMode, Navigation, Thumbs } from "swiper/modules";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";
import { TbTruckDelivery } from "react-icons/tb";
import { RiSecurePaymentLine } from "react-icons/ri";
import { MdCheckCircleOutline } from "react-icons/md";
import { LiaHandsHelpingSolid, LiaLinkedin } from "react-icons/lia";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { socialList } from "../components/constants";
import RelatedProduct from "../components/productdetails/RelatedProduct";
import ParagraphtoList from "../components/productdetails/ParagraphtoList";
import axios from "axios";
import { addToCart } from "../redux/slices/cartSlices";
import RightPartProduct from "../components/productdetails/RightPartProduct";
import ApiContext from "../components/baseapi/BaseApi";
import youtube from "../../src/assets/productdetails/youtube.png";
import { IoCartOutline } from "react-icons/io5";
import { RiShoppingBag2Fill } from "react-icons/ri";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import lineimg from "../assets/icons/star.jpg";

const ProductDetail = () => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [userChoice, setUserChoiceColor] = useState("");
  const [selectedColor, setSelectedColor] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const baseApi = useContext(ApiContext);
  const { slug, id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApi}/product/${id}`);
        const productData = response?.data?.data?.doc;

        setData(productData);

        // Checking if variants and options exist
        const firstValidVariant =
          productData?.variants && productData?.variants[0];
        const firstValidOption = firstValidVariant?.options?.[0];

        if (firstValidOption) {
          setSelectedColor(firstValidVariant);
          setUserChoiceColor(firstValidVariant.colorCode);
          setSelectedSize(firstValidOption.size); // Setting the selected size
        }

        const price =
          firstValidOption?.salePrice || firstValidOption?.price || 0; // Get the price
        const size = firstValidOption?.size || null; // Get the size

        // যদি category একটি object হয়, তখন তার name property নিতে হবে
        const category =
          productData?.category && productData?.category?.title
            ? productData?.category?.title
            : "Uncategorized"; // ডিফল্ট ক্যাটেগরি যদি না থাকে

        // Push the product details to dataLayer for GTM/Facebook Pixel
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "view_item",
          ecommerce: {
            currency: "BDT",
            detail: {
              products: [
                {
                  id: productData?._id, // Dynamic product ID
                  name: productData?.name, // Dynamic product name
                  category: category, // Dynamic product category
                  size: size || null, // Dynamically add size if exists, otherwise null
                  variant: firstValidVariant?.colorName || null, // Variant (color)
                  value: price, // Dynamic product price
                },
              ],
            },
          },
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(`${baseApi}/product/${id}`);
  //       const productData = response.data.data.doc;
  //       setData(productData);
  //       if (productData.variants && productData.variants.length > 0) {
  //         const firstValidVariant = productData.variants.find(
  //           (variant) => variant.options && variant.options.length > 0
  //         );

  //         if (firstValidVariant) {
  //           setSelectedColor(firstValidVariant);
  //           setUserChoiceColor(firstValidVariant.colorCode);
  //           setSelectedSize(firstValidVariant.options[0].size);
  //         }
  //       }
  //     } catch (err) {
  //       setError(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [id, location]);

  const getSelectedOptionStock = () => {
    if (data?.isBundle) return Infinity; // Bundles are not stock-limited here
    const selectedOption = selectedColor?.options?.find(
      (option) => option?.size === selectedSize
    ) || selectedColor?.options?.[0];
    return selectedOption?.stock ?? 0;
  };

  const handleAddToCart = () => {
    if (data?.isBundle) {
      // Add the entire bundle as a single item
      const bundleItem = {
        ...data,
        id: data._id,
        quantity: quantity,
      };

      dispatch(addToCart(bundleItem));
      setQuantity(1);
    } else {
      const selectedOption = selectedColor?.options.find(
        (option) => option.size === selectedSize
      );

      const availableStock = selectedOption?.stock ?? 0;

      // Check if the requested quantity exceeds the available stock
      if (availableStock > 0 && quantity > availableStock) {
        setError(
          `Only ${availableStock} unit${availableStock === 1 ? '' : 's'} available${
            selectedSize ? ` for size "${selectedSize}"` : ''
          }!`
        );
        return;
      }

      const item = {
        ...data,
        id,
        quantity,
        colorOptionId: selectedOption?._id,
        selectedOption,
        selectedColor,
      };

      dispatch(addToCart(item)); // Dispatch the item to the cart
      setQuantity(1); // Reset quantity after adding
      setError(""); // Clear error after successful add

      const price = selectedOption?.salePrice || selectedOption?.price || 0;

      // Google Tag Manager Tracking
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "BDT",
          add: {
            products: [
              {
                id: item?.id,
                name: item?.name,
                category: item?.category || "Uncategorized",
                variant: item?.selectedColor?.colorName || "Default Variant",
                value: price,
                quantity: item?.quantity,
                size: selectedSize,
              },
            ],
          },
        },
      });
    }
  };

  // const handleAddToCart = () => {
  //   const selectedOption = selectedColor?.options.find(
  //     (option) => option.size === selectedSize
  //   );

  //   const item = {
  //     ...data,
  //     id,
  //     quantity,
  //     colorOptionId: selectedOption?._id,
  //     selectedOption,
  //     selectedColor,
  //   };

  //   dispatch(addToCart(item));
  //   setQuantity(1);
  // };

  const handleSelectColorChange = (color) => {
    setUserChoiceColor(color);
  };

  const handleColorChange = (variant) => {
    setSelectedColor(variant);
    setUserChoiceColor(variant?.colorCode);

    if (variant?.options && variant?.options?.length > 0) {
      setSelectedSize(variant?.options[0]?.size);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  //   if (!selectedColor || !selectedColor.options) {
  //     return null;
  //   }

  //   return selectedColor.options.map((option) => (
  //     <button
  //       key={option._id}
  //       onClick={() => handleSizeChange(option.size)}
  //       className={`${
  //         selectedSize === option.size
  //           ? "bg-red-500 text-white"
  //           : "border"
  //       } px-2 py-1 rounded text-sm mx-2`}
  //     >
  //       {option.size}
  //     </button>
  //   ));
  // };

  const renderSizes = () => {
    if (!selectedColor || !selectedColor.options) {
      return null;
    }
    return (
      <select
        onChange={(e) => handleSizeChange(e.target.value)}
        className="border px-2 py-1 text-sm w-full"
        value={selectedSize || ""}
      >
        <option value="" disabled>
          Select a size
        </option>
        {selectedColor.options.map((option) => (
          <option key={option._id} value={option.size}>
            {option.size}
          </option>
        ))}
      </select>
    );
  };

  const renderPrice = () => {
    let selectedOption;

    if (selectedSize) {
      selectedOption = selectedColor?.options?.find(
        (option) => option?.size === selectedSize
      );
    } else {
      selectedOption = selectedColor?.options?.[0];
    }

    // Check if selectedOption exists and has valid price
    const price = selectedOption?.salePrice || selectedOption?.price || 0;

    // Ensure the price is a valid number
    const validPrice = price ? parseInt(price) : 0;
    // Log the price for debugging

    if (selectedOption) {
      return (
        <div>
          {selectedOption?.salePrice ? (
            <div className="flex text-2xl items-center gap-x-1 text-red-500">
              ৳ {validPrice}
              <div className="flex text-xl items-center gap-x-0.5 text-black line-through">
                {parseInt(selectedOption?.price)} tk
              </div>
            </div>
          ) : (
            <div className="flex text-2xl items-center gap-x-1 text-red-500">
              {/* ৳{data.isBundle ? data?.price :  validPrice } */}৳{" "}
              {validPrice}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex text-2xl items-center gap-x-5">
          <span className="text-red-500">
            ৳ {data?.price || <p>Price not available</p>}
          </span>
          <span className="text-sm line-through text-white bg-gray-500 px-2 py-[1px] rounded-lg">
            ৳ {data?.totalPrice || <p>Price not available</p>}
          </span>
        </div>
      );
    }

    // return <p>Price not available</p>;
  };

  const renderDiscount = () => {
    if (selectedSize) {
      const selectedOption = selectedColor?.options?.find(
        (option) => option?.size === selectedSize
      );

      if (selectedOption) {
        return (
          <>
            <div className="absolute right-4 top-24 z-10">
              {selectedOption?.freeShipping && (
                <h3 className="px-3 bg-green-600 text-white py-1 shadow-xl rounded-md">
                  Free Shipping
                </h3>
              )}
            </div>

            {selectedOption?.discountValue > 0 && (
              <div className="absolute right-3  top-28 z-10">
                <h3 className="px-3 bg-red-500 text-white py-1 shadow-xl rounded-full">
                  {selectedOption?.discountType == "percent" ? (
                    <> save <br /> {selectedOption?.discountValue} %</>
                  ) : (
                    <> save <br /> {selectedOption?.discountValue} ৳</>
                  )}
                </h3>
              </div>
            )}
          </>
        );
      }
    }
  };

  const renderDetails = () => {
    if (selectedColor?.details?.length > 0) {
      return <ParagraphtoList paragraph={selectedColor?.details} />;
    }
  };

  const photos = data?.photos || [];

  const isYouTubeLink = (url) => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("youtube.com/shorts")
    );
  };

  const handleSeeMoreClick = () => {
    setIsExpanded(!isExpanded);
  };

  const truncateDescription = (description, wordLimit = 30) => {
    if (!description) return "";
    const words = description.split(" ");
    if (words.length <= wordLimit) return description;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const descriptionText = data?.description;
  const isLongDescription =
    descriptionText && descriptionText.split(" ").length > 30;

  const stripHtmlTags = (html) => {
    return html.replace(/<[^>]*>/g, ""); // Removes all HTML tags
  };
  return (
    <>
      <section className="px-5 xl:px-0 py-10">
        <section className="max-w-screen-xl mx-auto">
          <div className="px-4 border">
            <h4 className="flex flex-wrap items-center gap-x-2 text-sm py-3">
              <span className="cursor-pointer hover:text-[#ef4444] text-texthead transition-all ease-linear duration-200">
                <Link to={"/"}>Home</Link>
              </span>{" "}
              <span>
                <FaChevronRight className="w-[5px] mt-0.5" />
              </span>{" "}
              <Link
                className="hover:text-[#ef4444] text-texthead transition-all ease-linear duration-200"
                to={"/shop"}
              >
                Shop
              </Link>{" "}
              <span>
                <FaChevronRight className="w-[5px] mt-0.5" />
              </span>{" "}
              <span>{data?.name}</span>
            </h4>
          </div>
        </section>
      </section>

      <section className="font-inter max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 ">
          <div className="bg-white rounded lg:col-span-2 ">
            {loading ? (
              <div className="animate-pulse flex flex-wrap justify-between ">
                <div className="w-full relative md:w-[50%] lg:w-[50%] xl:w-[40%] bg-gray-200 h-[590px] rounded-lg mb-4"></div>

                <div className="w-full md:w-[45%] lg:w-[45%] xl:w-[55%] px-5 lg:px-0">
                  <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-x-3 mt-4 md:mt-10">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mt-6 md:mt-10"></div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex mt-10 gap-x-8">
                    <div className="h-[60px] w-24 bg-gray-200 rounded"></div>
                    <div className="h-[60px] w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-5 flex-col md:flex-row xl:gap-14 p-5 xl:p-10">
                <div className="w-full relative md:w-[40%] lg:w-[50%] xl:w-[50%] product_Details">
                  {renderDiscount()}
                  <PhotoProvider>
                    {photos.length > 0 && (
                      <>
                        <Swiper
                          style={{
                            "--swiper-navigation-color": "#fff",
                            "--swiper-navigation-size": "25px",
                          }}
                          loop={true}
                          spaceBetween={10}
                          navigation={true}
                          thumbs={{ swiper: thumbsSwiper }}
                          modules={[FreeMode, Navigation, Thumbs, Autoplay]}
                          autoplay={{
                            delay: 2500,
                            disableOnInteraction: true,
                          }}
                          className="mySwiper2 w-full max-h-[590px] flex"
                          onSwiper={(swiper) =>
                            (window.swiperInstance = swiper)
                          }
                        >
                          {photos.map((item, index) => (
                            <SwiperSlide
                              key={index}
                              onTouchStart={() => {
                                if (window.swiperInstance?.autoplay) {
                                  window.swiperInstance.autoplay.stop();
                                }
                              }}
                              onTouchEnd={() => {
                                if (window.swiperInstance?.autoplay) {
                                  window.swiperInstance.autoplay.start();
                                }
                              }}
                              onMouseEnter={() => {
                                if (window.swiperInstance?.autoplay) {
                                  window.swiperInstance.autoplay.stop();
                                }
                              }}
                              onMouseLeave={() => {
                                if (window.swiperInstance?.autoplay) {
                                  window.swiperInstance.autoplay.start();
                                }
                              }}
                            >
                              {isYouTubeLink(item) ? (
                                (() => {
                                  let videoId = null;

                                  if (item.includes("youtube.com/shorts")) {
                                    videoId = item.split("shorts/")[1];
                                  } else if (item.includes("youtube.com")) {
                                    videoId = item
                                      .split("v=")[1]
                                      ?.split("&")[0];
                                  }

                                  if (videoId) {
                                    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
                                    return (
                                      <iframe
                                        id={`youtube-player-${index}`}
                                        width="100%"
                                        height="315"
                                        src={embedUrl}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={`YouTube Video ${index}`}
                                      ></iframe>
                                    );
                                  } else {
                                    return <div>Invalid YouTube Link</div>;
                                  }
                                })()
                              ) : (
                                <PhotoView src={item}>
                                  <img
                                    className="w-full object-contain"
                                    src={item}
                                    alt={`Image ${index}`}
                                  />
                                </PhotoView>
                              )}
                            </SwiperSlide>
                          ))}
                        </Swiper>

                        <Swiper
                          onSwiper={setThumbsSwiper}
                          loop={true}
                          slidesPerView={4}
                          freeMode={true}
                          watchSlidesProgress={true}
                          modules={[FreeMode, Navigation, Thumbs]}
                          className="mySwiper max-h-[180px]"
                        >
                          {photos.map((item, index) => (
                            <SwiperSlide key={index}>
                              {isYouTubeLink(item) ? (
                                <img
                                  className="w-full object-contain"
                                  src={youtube}
                                  alt="YouTube Thumbnail"
                                />
                              ) : (
                                <img
                                  className="w-full object-contain"
                                  src={item}
                                />
                              )}
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </>
                    )}
                  </PhotoProvider>
                </div>

                <div className="w-full ">
                  <h1 className="text-xl font-semibold">{data?.name}</h1>

                  <p className="text-gray-500 py-5 text-sm">
                    {descriptionText && descriptionText !== "undefined" && (
                      <>
                        <p>
                          {isLongDescription && !isExpanded
                            ? truncateDescription(
                              stripHtmlTags(descriptionText),
                              30
                            )
                            : stripHtmlTags(descriptionText)}
                        </p>
                        {isLongDescription && (
                          <button
                            onClick={handleSeeMoreClick}
                            className="text-blue-500 hover:underline mt-2 underline text-sm"
                          >
                            {isExpanded ? "See Less" : "See More"}
                          </button>
                        )}
                      </>
                    )}
                  </p>

                  <div className="my-5 text-2xl">{renderPrice()}</div>

                  <div>
                    {data?.variants?.length > 0 &&
                      data?.variants[0]?.colorCode &&
                      data?.variants[0]?.colorName &&
                      data?.variants?.some(
                        (variant) => variant?.options?.length > 0
                      ) && (
                        <div className="">
                          <h3 className="text-gray-900 mr-2 text-sm w-[20%] uppercase font-semibold">
                            {data?.variants?.length > 0 ? "Colors" : ""}
                          </h3>

                          <ul className="my-4 gap-2 flex overflow-hidden overflow-x-auto w-72 scrollbar-thin py-2">
                            {data?.variants
                              .filter((variant) => variant?.options?.length > 0)
                              .map((item, index) => (
                                <li
                                  onClick={() => {
                                    handleColorChange(item);
                                    handleSelectColorChange(item?.colorCode);
                                  }}
                                  key={index}
                                  className="w-9 h-9 flex justify-center items-center  relative"
                                >
                                  <button
                                    style={{
                                      backgroundColor: item?.colorCode,
                                    }}
                                    className={`w-8 h-8 text-sm rounded-full ${userChoice === item?.colorCode
                                      ? "shadow-2xl border-[2px] border-[#BE1E2D]"
                                      : "bg-gray-200 border-[1px] shadow-lg text-texthead "
                                      }`}
                                  >
                                    {/* {userChoice === item?.colorCode && (
                                      <span className="absolute text-green-500 text-2xl font-bold -top-1 -right-1">
                                        ✓
                                      </span>
                                    )} */}
                                  </button>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                  </div>
                  {data?.variants[0]?.options[0]?.size && (
                    <div className="text-2xl my-5">
                      <p className="text-gray-900 mr-2 text-sm w-[20%] uppercase mb-3 font-semibold">
                        Sizes
                      </p>
                      {renderSizes()}
                    </div>
                  )}

                  <div className="flex items-center mt-4 pb-5 gap-10">
                    <div className="h-full border flex border-border">
                      <div className="flex items-center justify-center w-20 h-12 relative">
                        {quantity}
                        <div className="absolute right-0">
                          <IoIosArrowUp
                            className="border w-6 h-6 cursor-pointer"
                            onClick={() => {
                              if (data?.isBundle === false) {
                                const stock = getSelectedOptionStock();
                                if (quantity < stock) {
                                  setQuantity(quantity + 1);
                                  setError("");
                                } else {
                                  setError(
                                    `Only ${stock} unit${
                                      stock === 1 ? '' : 's'
                                    } available${
                                      selectedSize
                                        ? ` for size "${selectedSize}"`
                                        : ''
                                    }!`
                                  );
                                }
                              } else {
                                setQuantity(quantity + 1);
                              }
                            }}
                          />

                          <IoIosArrowDown
                            className="border w-6 h-6 cursor-pointer"
                            onClick={() => {
                              if (quantity > 1) {
                                setQuantity(quantity - 1);
                                setError("");
                              }
                            }}
                            disabled={quantity === 1}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleAddToCart(data);
                        navigate("/checkout");
                      }}
                      style={{
                        animation: "zoom 1s ease-in-out infinite",
                      }}
                      className=" bg-secendary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-opacity-70 duration-200"
                    >
                      <IoCartOutline /> এখনই অর্ডার করুন
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}

                  <div className="mt-6 flex gap-4 justify-center">
                    <button
                      onClick={() => handleAddToCart(data)}
                      className="px-4 py-2 rounded flex justify-center items-center gap-2 border bg-gray-200 hover:bg-opacity-80 duration-200 w-full"
                    >
                      <RiShoppingBag2Fill /> কার্ট এ যোগ করুন
                    </button>
                  </div>

                  <div className="flex flex-col space-y-5 mt-5">
                    {data?.isBundle && (
                      <div className="text-xl">Items in this bundle:</div>
                    )}

                    <ul className="list-disc list-inside space-y-2">
                      {data?.bundleProducts?.map((item) => (
                        <li key={item.id} className="flex items-center gap-x-5">
                          <p>{item.name}</p>
                          <img
                            className="w-16 h-16 object-cover mt-3"
                            src={item.photos[0]}
                            alt={item.name}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-20 flex gap-4 items-center">
                    <p className="text-gray-400 text-sm w-[15%]">Follow Us On:</p>
                    {socialList.map((item, index) => {
                      let Icon = item.logo;
                      const bgColor =
                        item.name === "facebook"
                          ? "bg-[#074888] hover:bg-opacity-10"
                          : item.name === "instagram"
                            ? "bg-[#ff8650] hover:bg-opacity-10"
                            : item.name === "youtube"
                              ? "bg-[#ff8650] hover:bg-opacity-10"
                              : item.name === "tiktok"
                                ? "bg-[#ff8650] hover:bg-opacity-10"
                                : item.name === "whatsapp"
                                  ? "bg-[#25d366] hover:bg-opacity-10"
                                  : item.name === "twitter"
                                    ? "bg-[#000000] hover:bg-opacity-10"
                                    : item.name === "x"
                                      ? "bg-[#25d366] hover:bg-opacity-10"
                                      : item.name === "linkedin"
                                        ? "bg-[#1161AC] hover:bg-opacity-10"
                                        : "bg-[#1161AC] hover:bg-opacity-10";
                      return (
                        <Link
                          key={index}
                          className="text-texthead"
                          to={item.link}
                        >
                          <li
                            className={`w-10 h-10  flex items-center text-white justify-center border border-border ${bgColor} transition-all ease-linear duration-200 hover:text-white`}
                            key={index}
                          >
                            <Icon />
                          </li>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            {/* <div className="w-full xl:px-0 py-10">
              <h3 className="text-sm lg:text-lg font-bold text-texthead mt-1">
                View Products
              </h3>
              <img src={lineimg} alt="" className="" />
            </div> */}

            <RightPartProduct />
          </div>
        </div>

        <div className="w-full bg-white pt-10 px-5">
          <div className="flex flex-col md:flex-row">
            <div className="block lg:hidden">
              {/* <div className="w-full">
                <h3 className="text-sm lg:text-lg font-bold text-texthead mt-1">
                  View Products
                </h3>
                <img src={lineimg} alt="" className="" />
              </div> */}

              <RightPartProduct />
            </div>
            {selectedColor?.details?.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-texthead">
                  Product Details
                </h2>
                <img src={lineimg} alt="" className="" />
                <div className="py-5">{renderDetails()}</div>
              </div>
            )}
          </div>
          <RelatedProduct id={data?.category?._id} />
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
