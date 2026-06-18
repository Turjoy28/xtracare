import React, { useEffect, useState, useContext } from "react";
import { FaMinus } from "react-icons/fa6";
import Containar from "../../layouts/Containar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TiArrowBackOutline } from "react-icons/ti";
import { deleteFromCart, resetCart } from "../../redux/slices/cartSlices";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import axios from "axios";
import { MdOutlineDeleteForever } from "react-icons/md";
import ApiContext from "../baseapi/BaseApi";
import freeshippingImg from "../../assets/icons/freeshipping-BO3hBmAA.png";
import { FaUser } from "react-icons/fa";
import { IoIosCall } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { MdSpeakerNotes } from "react-icons/md";

const CheckoutForm = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCity, setLoadingCity] = useState(true);
  const [loadingZone, setLoadingZone] = useState(true);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [zonelist, setZoneList] = useState([]);
  const [arealist, setAreaList] = useState([]);
  const [cityKey, setCityKey] = useState(0);
  const [ZoneKey, setZoneKey] = useState(0);
  const baseApi = useContext(ApiContext);
  const [isShaking, setIsShaking] = useState(false);
  const [quantityDiscount, setQunatityDiscount] = useState([]);
  const [selectedQuantityValue, setSelectedQuantityValue] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    district: {},
    streetAddress: "",
    notes: "",
    area: {},
    zone: {},
    shipping: "",
    payment: "cod",
    couponCode: "",
  });

  useEffect(() => {
    setLoadingCity(true);
    if (cityKey !== 0) {
      getCZone(cityKey);
    }
  }, [cityKey]);

  useEffect(() => {
    setLoadingZone(true);
    getCArea(ZoneKey);
  }, [ZoneKey]);

  const getCZone = async (id) => {
    try {
      const response = await axios.post(
        `${baseApi}/pathaoLocation/city/${id}/zones`
      );

      setZoneList(response.data.data.data);
      if (response?.data?.data.data.length > 0) {
        setLoadingCity(false);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      return null;
    }
  };

  const getCArea = async (id) => {
    if (id === 0) {
      return;
    }
    try {
      const res = await axios.post(
        `${baseApi}/pathaoLocation/zone/${id}/area-list`
      );
      setAreaList(res?.data?.data?.data);
      if (res?.data?.data?.data?.length > 0) {
        setLoadingZone(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCouponCode = async () => {
    if (formData?.couponCode?.trim() === "") {
      setCouponError("কুপন কোড দেন");
      setCouponDiscount(0);
      formData.couponCode = "";
      return;
    }

    try {
      const response = await axios.get(
        `${baseApi}/coupon/${formData.couponCode}`
      );

      if (response.data.status == "success") {
        setCouponDiscount(response.data.data.coupon.discountPercent);
        setCouponError("");
      } else {
        setCouponError("কুপন কোডটি ভুল!");
        setCouponDiscount(0);
      }
    } catch (error) {
      console.error("Error fetching coupon", error);
      setCouponError("ভুল কুপন কোড দিয়েছেন! সঠিক কোড দেন।");
      setCouponDiscount(0);
    }
  };

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state?.cart?.items);

  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const hasFreeShipping = cartItems?.some(
    (item) => item?.selectedOption?.freeShipping === true
  );

  const fetchQuantityDiscount = async () => {
    const res = await axios.get(`${baseApi}/discount/apply`);

    const sortedData = res.data.data.sort(
      (a, b) => a.minQuantity - b.minQuantity
    );

    setQunatityDiscount(sortedData);
  };

  const settingDiscountItems = () => {
    const discountAmounts = quantityDiscount?.map((item) => item.minQuantity);

    const input = totalCartItems;
    if (input < discountAmounts[0]) {
      setSelectedQuantityValue(null);
      return;
    }

    let selectedIndex = null;

    for (let i = 0; i < discountAmounts.length; i++) {
      if (discountAmounts[i] <= input) {
        selectedIndex = i;
      }
    }

    setSelectedQuantityValue(selectedIndex);
  };

  useEffect(() => {
    if (cartItems?.length > 0) {
      const totalCost = calculateTotalCost();

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "InitiateCheckout",
        cartItems: cartItems?.map((item) => ({
          id: item?._id,
          name: item?.name,
          quantity: item?.quantity,
          price: item?.selectedOption?.price,
          size: item?.selectedOption?.size || null,
          color: item?.selectedColor?.colorName || null,
        })),
        totalCost: totalCost,
        currency: "BDT",
        itemCount: cartItems?.length,
      });
    }

    fetchQuantityDiscount();
  }, []);

  useEffect(() => {
    settingDiscountItems();
  }, [quantityDiscount, cartItems]);

  const calculateSubtotal = () => {
    return cartItems?.reduce((total, item) => {
      if (item?.isBundle) {
        const bundleTotal = item?.price || 0;
        return total + bundleTotal * item.quantity;
      } else {
        const itemPrice =
          couponDiscount > 0
            ? item?.selectedOption?.price
            : item?.selectedOption?.discountValue > 0
              ? Math.ceil(item?.selectedOption?.salePrice)
              : item?.selectedOption?.price;
        return total + itemPrice * item.quantity;
      }
    }, 0);
  };

  const getShippingCost = () => {
    if (hasFreeShipping) return 0;
    switch (formData?.shipping) {
      case "insideDhaka":
        return 70;
      case "outsideDhaka":
        return 140;
      default:
        return 0;
    }
  };

  const calculateBundleOffer = () => {
    const type = quantityDiscount[selectedQuantityValue]?.discountType;
    const discountValue =
      quantityDiscount[selectedQuantityValue]?.discountValue;
    if (type == "percent") {
      return (discountValue / 100) * calculateSubtotal();
    } else if (type == "amount") {
      return discountValue;
    }
  };

  const calculateTotalCost = () => {
    const subtotal = calculateSubtotal();
    const discount = (couponDiscount / 100) * subtotal;
    const shippingCost = getShippingCost();
    const bundleOffer = calculateBundleOffer();
    const total = subtotal - discount + shippingCost - (bundleOffer ?? 0);
    return Math.ceil(total);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    setFormData({
      ...formData,
      [name]: updatedValue,
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d{11,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone Number must be at least 11 digits";
    }
    if (!formData.streetAddress)
      newErrors.streetAddress = "Street Address is required";

    if (!formData.shipping && !hasFreeShipping)
      newErrors.shipping = "Shipping method is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setIsLoading(true);
      try {
        const bundleOffer = calculateBundleOffer();
        console.log("bundleOffer", cartItems)
        const orderData = {
          name: formData.fullName,
          phone: formData.phoneNumber,
          email: formData.email,
          streetAddress: formData.streetAddress,
          notes: formData.notes,
          shippingCost: getShippingCost(),
          products: cartItems?.map((item) => ({
            ...({ option: item?.colorOptionId }),
            quantity: item?.quantity,
            ...(item?.userChoiceColor && {
              userSelectedColor: item?.userChoiceColor,
            }),
          })),
          ...(formData.couponCode.trim() && { coupon: formData.couponCode }),
          bundleOffer: bundleOffer || 0,
        };
        console.log("orderData", orderData)

        const apiEndpoint = formData.couponCode.trim()
          ? `${baseApi}/order/withCoupon`
          : `${baseApi}/order`;

        const response = await axios.post(apiEndpoint, orderData);
        dispatch(resetCart());
        const data = {
          cartItems: cartItems?.map((item) => item?._id),
          calculateTotalCost: calculateTotalCost(),
          orderId: response?.data?.data?.order?._id,
        };
        navigate("/thankyou", { state: { data } });
      } catch (error) {
        setIsLoading(false);
        console.error("Error submitting order", error);
        setCouponError(
          error.response?.data?.message ||
          "An error occurred while placing the order"
        );
      }
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      shipping: "",
      payment: "cod",
      couponCode: "",
      notes: "",
      streetAddress: "",
    });
    setErrors({});
  };



  return (
    <section className="py-20 font-inter">
      {cartItems?.length > 0 ? (
        <Containar>
          <div>
            <div className="grid grid-cols-12 md:gap-x-8">
              <div className="col-span-12 order-2 lg:order-1 lg:col-span-8  ">
                <div className="bg-white pt-4 pb-8 px-6 rounded border">
                  <h2 className="font-medium uppercase">
                    Personal Information
                  </h2>
                  <div className="mt-2">
                    <form onSubmit={handleSubmit}>
                      <div className="w-full flex items-start flex-wrap justify-between">
                        <div className="w-full flex items-center">
                          <FaUser className="w-12 h-9 bg-gray-200 p-2 rounded-l" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`w-full h-9 px-3 border  rounded-r ${errors.fullName
                              ? "border-red-500"
                              : "border-border"
                              }`}
                            placeholder="Full Name *"
                          />
                        </div>
                      </div>
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-0.5">
                          {errors.fullName}
                        </p>
                      )}
                      <div className="w-full flex items-start flex-wrap justify-between mt-5">
                        <div className="w-full lg:w-[48%] flex items-center">
                          <IoIosCall className="w-12 h-9 bg-gray-200 p-2 rounded-l" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`w-full h-9 px-3 border  rounded-r ${errors.phoneNumber
                              ? "border-red-500"
                              : "border-border"
                              }`}
                            placeholder="Mobile Number *"
                          />
                        </div>

                        <div className="w-full lg:w-[48%]  mt-5 lg:mt-0 flex items-center">
                          <MdEmail className="w-12 h-9 bg-gray-200 p-2 rounded-l" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full h-9 px-3 border border-border rounded-r"
                            placeholder="email (if have)"
                          />
                        </div>
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-0.5">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>

                      <h2 className="text-texthead text-lg font-medium my-5 uppercase">
                        Shipping
                      </h2>
                      <div className="w-full  lg:mt-0">
                        <p className="pb-2">
                          Address <small>(city, area, road no, house no)</small>
                        </p>
                        <textarea
                          type="text"
                          name="streetAddress"
                          value={formData.streetAddress}
                          onChange={handleChange}
                          className={`w-full h-20 px-3 border  rounded-r ${errors.streetAddress
                            ? "border-red-500"
                            : "border-border"
                            }`}
                          placeholder="your full address"
                        />
                      </div>
                      {errors.streetAddress && (
                        <p className="text-red-500 text-sm mt-0.5">
                          {errors.streetAddress}
                        </p>
                      )}
                      <div className="w-full  mt-5 flex items-start">
                        <MdSpeakerNotes className="w-12 h-9 bg-gray-200 p-2 rounded-l" />
                        <textarea
                          type="text"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          className="w-full h-12 px-3 border border-border rounded-r"
                          placeholder="note (delivery related)"
                        />
                      </div>

                      <div className="w-full flex items-center flex-wrap justify-between mt-3">
                        {hasFreeShipping ? (
                          <div className="flex gap-2 items-center">
                            <img
                              src={freeshippingImg}
                              alt=""
                              className="w-32"
                            />{" "}
                            <span className="blinking-text">
                              product. Yeah!!!
                            </span>
                          </div>
                        ) : (
                          <div className="w-full lg:w-[49%] mt-5">
                            <h4 className="text-[15px] font-medium mb-2 uppercase">
                              Delivery Method *
                            </h4>
                            <div>
                              <label className="flex items-center text-sm font-medium gap-5 cursor-pointer border px-5 py-2">
                                <input
                                  name="shipping"
                                  id="shippingInsideDhaka"
                                  type="radio"
                                  value="insideDhaka"
                                  checked={formData.shipping === "insideDhaka"}
                                  onChange={handleChange}
                                  required={!hasFreeShipping}
                                  disabled={hasFreeShipping}
                                  className="scale-150 cursor-pointer"
                                />
                                <div className="flex items-center gap-2">
                                  <h3>Inside Dhaka</h3>
                                  <h4 className="flex items-center gap-x-0.5">
                                    ৳ 70
                                  </h4>
                                </div>
                              </label>
                              <label className="mt-2  gap-5 flex items-center text-sm font-medium  cursor-pointer border px-5 py-2">
                                <input
                                  name="shipping"
                                  id="shippingOutsideDhaka"
                                  type="radio"
                                  value="outsideDhaka"
                                  checked={formData.shipping === "outsideDhaka"}
                                  onChange={handleChange}
                                  required={!hasFreeShipping}
                                  disabled={hasFreeShipping}
                                  className="scale-150 cursor-pointer"
                                />
                                <div className="flex items-center gap-2">
                                  <h3>Outside Dhaka</h3>
                                  <h4 className="flex items-center gap-x-0.5">
                                    ৳ 140
                                  </h4>
                                </div>
                              </label>
                            </div>
                            {errors.shipping && (
                              <p className="text-red-500 text-sm mt-2">
                                {errors.shipping}
                              </p>
                            )}
                          </div>
                        )}
                        {/* Comment Cupon Field   */}

                        {/* <div className="w-full lg:w-[49%] mt-5">
                          <h4 className="text-[15px] font-medium mb-2  uppercase">
                            Coupon (if have)
                          </h4>
                          <div className="flex items-center">
                            <input
                              type="text"
                              name="couponCode"
                              value={formData.couponCode}
                              onChange={handleChange}
                              className={`w-full h-10 px-3 border  ${errors.couponCode
                                  ? "border-red-500"
                                  : "border-border"
                                }`}
                              placeholder="enter your coupon"
                            />
                            <button
                              type="button"
                              onClick={handleCouponCode}
                              className=" bg-[#74D09D] hover:opacity-60 transition-all ease-linear duration-200 text-white w-48 lg:px-5 py-2.5 rounded-r text-sm"
                            >
                              Apply Coupon
                            </button>
                          </div>
                          {couponError && (
                            <p className="text-red-500 text-sm mt-2">
                              {couponError}
                            </p>
                          )}

                          {couponDiscount > 0 && !couponError && (
                            <p className="text-green-600 text-sm mt-2">
                              Coupon applied! discount: {couponDiscount}%
                            </p>
                          )}
                        </div> */}
                      </div>
                      <div className="mt-6 flex gap-4">
                        {/* <button
                          type="button"
                          onClick={handleReset}
                          disabled={isLoading}
                          className="px-10 rounded bg-gray-200 hover:text-white hover:bg-red-500 transition-colors duration-200"
                        >
                          Reset
                        </button> */}
                        <button
                          type="submit"
                          style={{
                            animation: isShaking
                              ? "shake 0.3s ease-in-out"
                              : "none",
                          }}
                          disabled={isLoading}
                          className="w-full rounded py-3 flex items-center text-white justify-center font-medium hover:bg-opacity-75 transition-all ease-linear duration-200 bg-[#74D09D] cursor-pointer"
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin h-5 w-5 mr-3 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 0116 0 8 8 0 01-16 0z"
                                ></path>
                              </svg>
                              order processing ...
                            </span>
                          ) : (
                            "এখনই অর্ডার করুন"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-span-12 order-1 lg:order-2 mt-5 lg:mt-0 lg:col-span-4">
                <div className="pt-3 bg-white shadow-md border border-texthead rounded">
                  <div className=" border-b border-b-border">
                    <h2 className="px-6 mb-3 text-texthead text-lg font-medium uppercase">
                      Order Overview
                    </h2>
                    <ul className="">
                      {cartItems?.map((item) => (
                        <li
                          key={item?._id}
                          className="px-3 flex items-center justify-between text-sm py-1 border-b border-gray-200"
                        >
                          {/* Box for the item */}
                          <div className="flex items-center gap-x-4 w-full">
                            {/* Image Section */}
                            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={item?.photos[0] || "/default-image.jpg"} // Default image if none exists
                                alt={item?.name}
                                className="object-cover w-full h-full"
                              />
                            </div>

                            {/* Item Details */}
                            <div className="w-[50%]">
                              <Link
                                to={`/productdetail/${item?.name}/${item?._id}`}
                                className="text-texthead cursor-pointer hover:text-red-500 transition-all ease-linear duration-200"
                              >
                                {item?.name?.slice(0, 50)}
                              </Link>

                              <span className="text-red-500">
                                {" "}
                                × {item?.quantity}
                              </span>
                              {item?.selectedOption?.size && (
                                <p className="text-sm mt-2 font-normal capitalize">
                                  <span>Size:</span>{" "}
                                  <span className="ml-2 text-[#807f7f]">
                                    {item?.selectedOption?.size}
                                  </span>
                                </p>
                              )}
                              {item?.selectedColor?.colorName && (
                                <p className="text-sm font-normal">
                                  <span>Color:</span>
                                  <span className="ml-2 text-[#807f7f]">
                                    {item?.selectedColor?.colorName}
                                  </span>
                                </p>
                              )}
                            </div>

                            {/* Price and Delete Button */}
                            {/* <div className="flex items-center gap-x-2 bg-red-300">
                              {couponDiscount > 0 ? (
                                <span className="text-sm font-medium text-red-500">
                                  {item?.selectedOption?.price}
                                </span>
                              ) : (
                                <>
                                  <span className="text-sm font-medium text-texthead">
                                    ৳{" "}
                                    {(item?.selectedOption?.discountValue > 0
                                      ? Math?.ceil(
                                          item?.selectedOption?.salePrice
                                        )
                                      : item?.selectedOption?.price) *
                                      item?.quantity}
                                  </span>
                                  {item?.selectedOption?.discountValue > 0 && (
                                    <del className="line-through text-normal text-red-500">
                                      ৳{" "}
                                      {item?.selectedOption?.discountValue >
                                        0 &&
                                        item?.selectedOption?.price *
                                          item?.quantity}
                                    </del>
                                  )}
                                </>
                              )}

                              <span
                                onClick={() =>
                                  dispatch(
                                    deleteFromCart({
                                      id: item._id,
                                      colorOptionId: item?.selectedOption?._id,
                                      selectedSize: item?.selectedSize,
                                    })
                                  )
                                }
                                className="text-red-500 cursor-pointer text-lg"
                              >
                                <MdOutlineDeleteForever />
                              </span>
                            </div> */}
                            <div className="flex items-center gap-x-2 ">
                              {item?.isBundle ? (
                                <span className="text-sm font-medium text-texthead">
                                  ৳ {item?.price * item?.quantity}
                                </span>
                              ) : (
                                <>
                                  <div className="flex items-center gap-x-2">
                                    {couponDiscount > 0 ? (
                                      <span className="text-sm font-medium text-red-500">
                                        {item?.selectedOption?.price}
                                      </span>
                                    ) : (
                                      <>
                                        <span className="text-sm font-medium text-texthead">
                                          ৳{" "}
                                          {(item?.selectedOption
                                            ?.discountValue > 0
                                            ? Math?.ceil(
                                              item?.selectedOption?.salePrice
                                            )
                                            : item?.selectedOption?.price) *
                                            item?.quantity}
                                        </span>
                                        {item?.selectedOption?.discountValue >
                                          0 && (
                                            <del className="line-through text-normal text-red-500">
                                              ৳{" "}
                                              {item?.selectedOption
                                                ?.discountValue > 0 &&
                                                item?.selectedOption?.price *
                                                item?.quantity}
                                            </del>
                                          )}
                                      </>
                                    )}

                                    {/* <span
                                      onClick={() =>
                                        dispatch(
                                          deleteFromCart({
                                            id: item._id,
                                            colorOptionId:
                                              item?.selectedOption?._id,
                                            selectedSize: item?.selectedSize,
                                          })
                                        )
                                      }
                                      className="text-red-500 cursor-pointer text-lg"
                                    >
                                      <MdOutlineDeleteForever />
                                    </span> */}
                                  </div>
                                  {/* {item?.selectedOption?.discountValue > 0 && (
                                    <del className="line-through text-normal text-red-500">
                                      ৳{" "}
                                      {item?.selectedOption?.price *
                                        item?.quantity}
                                    </del>
                                  )} */}
                                </>
                              )}

                              <span
                                onClick={() =>
                                  dispatch(
                                    deleteFromCart({
                                      id: item._id,
                                      colorOptionId: item?.selectedOption?._id,
                                      selectedSize: item?.selectedSize,
                                    })
                                  )
                                }
                                className="text-red-500 cursor-pointer text-lg"
                              >
                                <MdOutlineDeleteForever />
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="py-5 border-b border-b-border">
                      <ul className=" px-6 flex items-center justify-between text-base">
                        <li>Coupon Discount</li>
                        <li className="flex items-center gap-x-0.5">
                          <FaMinus className="mr-1" /> {couponDiscount} %
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="py-3 border-b border-b-border">
                    <ul className=" px-6 flex items-center justify-between text-base">
                      <li className="uppercase">Subtotal</li>
                      <li className="flex items-center gap-x-0.5">
                        <span className="mr-1">৳</span>
                        {couponDiscount > 0
                          ? Math.ceil(
                            calculateSubtotal() -
                            calculateSubtotal() * (couponDiscount / 100)
                          )
                          : calculateSubtotal()}
                      </li>
                    </ul>
                  </div>

                  <div className="py-3 border-b border-b-border">
                    <div>
                      <h2 className="px-6 uppercase text-texthead font-medium">
                        Shipping Charge
                      </h2>
                      <div className="mt-3 px-6 text-sm flex justify-between items-center">
                        <div className="flex items-start text-base font-normal gap-x-1">
                          <input
                            className="mt-1"
                            name="payment"
                            id="paymentCOD"
                            type="radio"
                            value="cod"
                            checked={formData.payment === "cod"}
                            onChange={handleChange}
                            required
                          />
                          <div>
                            <h3>Cash on Delivery</h3>
                          </div>
                        </div>
                        <div className="flex items-start text-base font-normal gap-x-1">
                          <h3 className="flex items-center gap-x-1 text-sm">
                            <span className="mr-1">৳</span> {getShippingCost()}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5">
                      <h2 className="px-6 uppercase text-texthead font-medium">
                        Bundle Discount
                      </h2>

                      {selectedQuantityValue !== null &&
                        quantityDiscount[selectedQuantityValue] ? (
                        <div className="mt-3 px-6 text-sm flex justify-between items-center">
                          <div className="flex items-start text-lg gap-x-1 font-bold">
                            <div>
                              {
                                quantityDiscount[selectedQuantityValue]
                                  ?.minQuantity
                              }{" "}
                              item bundle{" "}
                              <span className="font-normal text-xs">
                                (
                                {
                                  quantityDiscount[selectedQuantityValue]
                                    ?.discountValue
                                }
                                {quantityDiscount[selectedQuantityValue]
                                  ?.discountType === "percent"
                                  ? "%"
                                  : "Tk."}{" "}
                                off)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start text-base gap-x-1 font-bold">
                            <h3 className="flex items-center gap-x-1 text-lg">
                              <span className="mr-1">- ৳</span>{" "}
                              {Math.round(calculateBundleOffer())}
                            </h3>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 px-6 text-sm text-gray-500 italic">
                          No bundle offer available
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="py-3 border-b border-b-border flex justify-between">
                    <h2 className="px-6 uppercase text-texthead text-lg font-medium">
                      Total Cost
                    </h2>
                    <h2 className="px-6 capitalize text-red-500 text-lg font-bold flex items-center gap-x-1">
                      <span className="mr-1">৳</span> {calculateTotalCost()}
                    </h2>
                  </div>

                  <div className="py-3 border-b border-b-border">
                    <p className="px-6 text-sm font-normal">
                      Your personal data will be used to process your order,
                      support your experience throughout this website, and for
                      other purposes described in our
                      <Link
                        to={"/privacy"}
                        className="text-red-500 underline ml-2"
                      >
                        privacy policy
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="mt-1">
                  <button
                    onClick={() => navigate("/cart")}
                    className="py-5 w-full flex rounded items-center justify-center border-black border text-black hover:text-white duration-200 font-medium hover:bg-black"
                  >
                    <span className="flex items-center gap-x-1">
                      <TiArrowBackOutline /> View cart
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Containar>
      ) : (
        <div className="">
          <div className="flex justify-center items-center">
            <HiOutlineShoppingBag className="text-7xl" />
          </div>
          <h2 className="text-center text-2xl font-medium mt-5">
            Your Cart is currently empty.
          </h2>
          <div className="flex justify-center items-center mt-6 pb-10">
            <Link
              className="text-lg bg-texthead hover:bg-black transition-all ease-linear duration-200 font-medium px-5 py-2 text-white"
              to={"/shop"}
            >
              Return to shop
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default CheckoutForm;
