import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlices";
import axios from "axios";
import ApiContext from "../baseapi/BaseApi";
import { TiTick } from "react-icons/ti";
import { motion } from "framer-motion";
import productImage from "../../assets/product/product.webp";
const ProductItem = ({
  image = [],
  product,
  discount,
  subtitle,
  title,
  brandName,
  categoryName,
  offerprice,
  regularprice,
  classItem,
  categoryId,
  brandId,
  discountType,
  discountPercent,
  priceAfterDiscount,
  id,
  slug,
  freeShipping,
  achieveSizes,
  bundleCheck, // Add bundleCheck prop
}) => {
  const dispatch = useDispatch();
  const baseApi = useContext(ApiContext);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModalCart, setShowModalCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const totalStock = achieveSizes?.reduce(
    (total, size) => total + size?.stock,
    0
  );

  // Check if the product is available (either in stock or a bundle)
  const isProductAvailable = totalStock > 0 || bundleCheck;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setShowModalCart(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  const handleFetchOptionData = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${baseApi}/product/${item?._id}/options`
      );
      const fetchedOptions = response?.data?.data?.options || [];
      if (item?.isBundle) {
        console.log("6666666666666666666");
        setOptions(fetchedOptions);
        await handleAddToCart(fetchedOptions);
        navigate("/checkout");
        return;
      }

      const isEmpty = fetchedOptions[0]?.size === "";

      if (isEmpty) {
        setOptions(fetchedOptions);
        await handleAddToCart(fetchedOptions);
        navigate("/checkout");
        return;
      } else {
        setOptions(fetchedOptions);
        setShowModal(true);
      }
    } catch (err) {
      setError("Failed to fetch options. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchOptionDataCart = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${baseApi}/product/${item?._id}/options`
      );
      const fetchedOptions = response?.data?.data?.options || [];

      // If the product is a bundle, skip size selection
      if (item?.isBundle) {
        console.log("6666666666666666666");
        setOptions(fetchedOptions);
        await handleAddToCart(fetchedOptions);
        return;
      }
      console.log("Fetching");
      // For non-bundle products, check for size
      const isEmpty =
        fetchedOptions[0]?.size === "" ||
        fetchedOptions[0]?.size === selectedSize;

      if (isEmpty) {
        console.log("isEmpty");

        setOptions(fetchedOptions);
        await handleAddToCart(fetchedOptions);
        return;
      } else {
        console.log("else");

        setOptions(fetchedOptions);
        // setShowModal(true);
        setShowModalCart(true);
      }
    } catch (err) {
      setError("Failed to fetch options. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (currentOptions = options) => {
    if (product?.isBundle) {
      const selectedOption = currentOptions[0];
  console.log("selected option", selectedOption)
      const item = {
        ...product,
        id: product?._id,
        quantity: 1,
        photos: product?.photos,
        name: product?.name,
        colorOptionId: selectedOption?._id,
        selectedOption: {
          _id: selectedOption?._id,
          sku: selectedOption?.sku,
          size: selectedOption?.size,
          price: selectedOption?.price,
          salePrice: selectedOption?.salePrice,
          stock: selectedOption?.stock,
          discountType: selectedOption?.discountType,
          discountValue: selectedOption?.discountValue,
          freeShipping: selectedOption?.freeShipping,
        },
      };
      console.log("item",item)

      dispatch(addToCart(item));
    } else {
    // For non-bundle products, handle size selection
    console.log("Product", currentOptions);
    const selectedOption = currentOptions.find(
      (option) => option.size === "" || option.size === selectedSize
    );

    const item = {
      ...product,
      id: product?._id,
      quantity: 1,
      photos: product?.photos,
      name: product?.name,
      colorOptionId: selectedOption?._id,
      selectedOption: {
        _id: selectedOption?._id,
        sku: selectedOption?.sku,
        size: selectedOption?.size,
        price: selectedOption?.price,
        salePrice: selectedOption?.salePrice,
        stock: selectedOption?.stock,
        discountType: selectedOption?.discountType,
        discountValue: selectedOption?.discountValue,
        freeShipping: selectedOption?.freeShipping,
      },
    };

    dispatch(addToCart(item));
    }
  };

  const handleSizeClick = (size) => {
    console.log("click", size);
    setSelectedSize(size);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseModalCart = () => {
    setShowModalCart(false);
  };

  const titlee = product?.name || title || "";

  const [imageLoaded, setImageLoaded] = useState(false);

  const slg = titlee
    .toLowerCase()
    .trim()
    .replace(/[^\u0980-\u09FF0-9a-zA-Z\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const uniqueOptions = [...new Set(options?.map((option) => option?.size))];

  return (
    <>
      <motion.div className="max-w-xs overflow-hidden mx-1 group relative">
        {isProductAvailable ? (
          <Link to={`/productdetail/${slg}/${id}`}>
            <div className="overflow-hidden group relative">
              {!imageLoaded && (
                <div className="absolute inset-0 flex justify-center items-center bg-gray-100">
                  <img
                    className={`w-full aspect-square object-cover mx-auto transition-transform duration-300 hover:scale-105 
              ${imageLoaded ? "opacity-0" : "opacity-100"}
              `
                    }
                    src={productImage}
                    alt="product"
                  />
                </div>
              )}

              <img
                className={`w-full aspect-square object-cover mx-auto transition-transform duration-300  ${imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                src={image[0]}
                alt="product"
                onLoad={() => setImageLoaded(true)} // ইমেজ লোড হলে স্টেট আপডেট হবে
              />

              {discount > 0 && discountType === "amount" ? (
                <div className="absolute right-3 top-8 p-2 rounded-full justify-center shadow-lg text-xs bg-red-500 text-white flex items-center gap-x-0.5">
                  save <br /> {discount}৳
                </div>
              ) : (
                discount > 0 &&
                discountType === "percent" && (
                  <div className="absolute right-3 top-8 p-2 rounded-full justify-center shadow-lg text-xs bg-red-500 text-white flex items-center gap-x-0.5">
                    save <br /> {discount}%
                  </div>
                )
              )}
              {freeShipping && (
                <div className="absolute right-0 left-0 bottom-0 flex justify-center mx-auto w-28 py-1 px-2 bg-[#10B1DF] text-[10px] text-white gap-x-0.5 rounded-full">
                  Free Shipping
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="overflow-hidden cursor-not-allowed">
            <img
              className="w-full aspect-square object-cover mx-auto opacity-50 duration-300 group-hover:scale-105"
              src={image[0]}
              alt="product"
            />
          </div>
        )}
        <div className="bg-gray-50 py-4 px-2">
          <div className="lg:px-4 text-center">
            <h2 className="font-semibold h-8">
              <Link
                to={`/productdetail/${slg}/${id}`}
                className="Truncate text-sm leading-5 inline-block font-medium text-gray-900 mt-1 text-ellipsis overflow-hidden break-words"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                {title}
              </Link>
            </h2>
            <div className="flex flex-col items-center py-2">
              <div className="flex items-center pb-2">
                <span className="text-lg font-semibold text-gray-900">
                  <span className="">৳</span>
                  {priceAfterDiscount
                    ? Math.round(priceAfterDiscount)
                    : regularprice}
                </span>
                {priceAfterDiscount > 0 && (
                  <span className="text-sm text-[#BD1E2D] line-through ml-2">
                    <span className="mr-1">৳</span>
                    {regularprice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* {bundleCheck ? (
            <button
              className="border-secendary border hover:bg-secendary duration-200 hover:text-white text-secendary text-xs font-semibold md:px-2 py-2 text-center mx-auto w-[70%] block"
              style={{
                animation: "zoom 1s ease-in-out infinite",
              }}
            >
              <Link className="" to={`/productdetail/${slg}/${id}`}>
                View Bundle
              </Link>
            </button>
          ) :  */}
          <div className="flex gap-3 md:gap-5">
            <div
              className={`relative group duration-200 w-full ${
                isProductAvailable
                  ? "cursor-pointer hover:bg-secendary text-secendary  hover:text-white"
                  : "cursor-not-allowed text-gray-400"
              } flex justify-center`}
            >
              {isProductAvailable && (
                <button
                  onClick={
                    isProductAvailable
                      ? () => handleFetchOptionDataCart(product)
                      : null
                  }
                  className="border-secendary border hover:bg-secendary duration-200 hover:text-white text-secendary text-xs font-semibold md:px-2 py-2 w-full text-center "
                >
                  Add to Cart
                </button>
              )}
            </div>

            <div
              style={{
                animation: "zoom 1s ease-in-out infinite",
              }}
              className={`relative group duration-200 w-full ${
                isProductAvailable
                  ? "cursor-pointer hover:bg-customRed text-gray-500  hover:text-white"
                  : "cursor-not-allowed text-gray-400"
              } flex justify-center`}
            >
              {isProductAvailable && (
                <button
                  disabled={!isProductAvailable}
                  onClick={
                    isProductAvailable
                      ? () => handleFetchOptionData(product)
                      : null
                  }
                  className=" bg-secendary text-white hover:bg-primary duration-200  text-xs font-semibold w-full text-center"
                >
                  Order Now
                </button>
              )}
            </div>
          </div>

          {/* } */}
        </div>

        {!bundleCheck && showModal && (
          <div className="absolute inset-0 z-30 bg-black bg-opacity-0 flex justify-center items-center">
            <div
              ref={modalRef}
              className="absolute bg-gray-200 bottom-0 p-4 w-full h-full max-w-full rounded shadow-lg"
            >
              <div className="flex items-center justify-center h-full">
                <div>
                  <h3 className="text-sm mb-4 text-center font-bold underline">
                    Select Size
                  </h3>
                  {loading ? (
                    <p></p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2 items-center justify-center pb-10">
                      {uniqueOptions?.map((size, index) => (
                        <li
                          key={index}
                          className={`py-1 px-2 border ${selectedSize === size
                            ? "bg-red-500 text-white"
                            : "border border-gray-400"
                            } cursor-pointer`}
                          onClick={() => handleSizeClick(size)}
                        >
                          <div className="flex flex-wrap items-center text-sm">
                            <span>{size}</span>
                            <span className="text-xs text-gray-500">
                              {options.find((option) => option.size === size)
                                ?.stock > 0
                                ? ""
                                : "Out of Stock"}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-x-5 justify-center px-2">
                    <button
                      className="px-2 py-0.5 text-sm bg-texthead text-white rounded"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      className={`px-2 text-sm py-0.5 bg-[#74D09D] text-white rounded flex items-center ${!selectedSize ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      onClick={() => {
                        if (selectedSize) {
                          handleAddToCart();
                          navigate("/checkout");
                        }
                      }}
                      disabled={!selectedSize}
                    >
                      Confirm
                      <TiTick className="text-xl  duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showModalCart && (
          <div className="absolute inset-0 z-30 bg-red bg-opacity-30 flex justify-center items-center">
            <div
              ref={modalRef}
              className="bg-white border absolute bottom-0 p-4 w-full max-w-full rounded shadow-xl flex flex-col justify-center items-center"
            >
              <h3 className="text-sm font-semibold mb-4">Select Size</h3>
              {loading ? (
                <p></p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <ul className="flex gap-2 items-center justify-center pb-10">
                  {uniqueOptions.map((size, index) => (
                    <li
                      key={index}
                      className={`py-1 px-2 border ${selectedSize === size
                        ? "bg-red-500 text-white"
                        : "border border-gray-400"
                        } cursor-pointer`}
                      onClick={() => handleSizeClick(size)}
                    >
                      <div className="flex flex-wrap items-center text-sm">
                        <span>{size}</span>
                        <span className="text-xs text-gray-500">
                          {options.find((option) => option.size === size)
                            ?.stock > 0
                            ? ""
                            : "Out of Stock"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2 mt-[-12px]">
                <button
                  className="px-2 py-0.5 text-sm bg-texthead text-white rounded"
                  onClick={handleCloseModalCart}
                >
                  Cancel
                </button>
                <button
                  className={`px-2 text-sm py-0.5 bg-[#74D09D] text-white rounded flex items-center ${!selectedSize ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  onClick={() => {
                    setShowModalCart(false);
                    handleAddToCart();
                  }}
                  disabled={!selectedSize}
                >
                  Confirm
                  <TiTick className="text-xl  duration-200" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ProductItem;
