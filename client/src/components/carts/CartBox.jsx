import React, { useEffect } from "react";
import Containar from "../../layouts/Containar";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementQuantity,
  deleteFromCart,
  incrementQuantity,
  resetCart,
} from "../../redux/slices/cartSlices";
import { PiPercentBold } from "react-icons/pi";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
const CartBox = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const totalItems = cartItems.reduce(
    (total, item) => total + item?.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item?.selectedOption?.discountValue > 0
        ? Math?.ceil(item?.selectedOption?.salePrice)
        : item?.selectedOption?.price) *
      item?.quantity,
    0
  ); // Example static value for tax
  const total = subtotal;

  useEffect(() => {
    // Push data to the data layer for each cart item
    if (cartItems.length > 0) {
      window.dataLayer = window.dataLayer || [];

      cartItems.forEach((item) => {
        window.dataLayer.push({
          event: "add_to_cart", // or 'view_cart' depending on the event
          ecommerce: {
            currencyCode: "BDT",
            add: {
              products: [
                {
                  id: item._id,
                  name: item.name,
                  price:
                    item.selectedOption?.discountValue > 0
                      ? Math.ceil(item.selectedOption?.salePrice)
                      : item.selectedOption?.price,
                  quantity: item.quantity,
                  size: item.selectedOption?.size || "Not specified",
                  color: item.selectedColor?.colorName || "Not specified",
                },
              ],
            },
          },
        });
      });
    }
  }, [cartItems]);

  return (
    <section className="">
      <section className="max-w-screen-xl 2xl:max-w-screen-2xl mx-auto">
        {cartItems?.length > 0 ? (
          <div className="py-5 font-inter">
            <div>
              <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 sm:gap-x-8">
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-medium text-texthead uppercase border p-5">
                    Shopping Cart
                    {/* <span className="text-gray-400">{totalItems}</span> items */}
                  </h2>
                  <div className="border">
                    {cartItems?.length > 0 ? (
                      <>
                        {/* Debugging: Log cartItems */}
                        {cartItems?.map((item, index) => (
                          <ul
                            key={item?.id}
                            className={`p-5 bg-white flex items-center justify-center gap-5 ${index === cartItems.length - 1 ? "" : "border-b"
                              }`}
                          >
                            <li className="w-[60%] font-medium">
                              <div className="md:flex gap-x-4 items-center">
                                <div className="w-[90px] relative">
                                  {item?.photos && item?.photos.length > 0 ? (
                                    <img
                                      className="w-full object-contain"
                                      src={item?.photos[0]}
                                      alt={item?.name}
                                    />
                                  ) : (
                                    <p></p>
                                  )}
                                  {item?.selectedOption?.discountValue > 0 && (
                                    <p className="text-xs cursor-pointer absolute right-1 bottom-0 mt-2 px-2 text-white rounded-md py-0.5 bg-danger inline-block">
                                      {item?.selectedOption?.discountType ===
                                        "amount" ? (
                                        <span className="flex font-bold items-center gap-x-0.5">
                                          {" "}
                                          save
                                          {
                                            item?.selectedOption?.discountValue
                                          }{" "}
                                          ৳
                                        </span>
                                      ) : (
                                        <span className="flex font-bold items-center gap-x-0.5">
                                          save {item?.selectedOption?.discountValue}{" "}
                                          <PiPercentBold />
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <div className="text-[#414141]">
                                    <h2 className="text-base cursor-pointer transition-all ease-linear duration-200 font-normal">
                                      <Link
                                        to={`/productdetail/${item?.name}/${item?._id}`}
                                      >
                                        {item?.name?.slice(0, 300)}
                                      </Link>
                                    </h2>

                                    <p className="flex items-center gap-x-1 text-sm text-[#807f7f]">
                                      <span>৳</span>
                                      {item?.selectedOption?.discountValue >
                                        0 ? (
                                        <span className="flex gap-x-2">
                                          {Math?.ceil(
                                            item?.selectedOption?.salePrice
                                          )}
                                          <del>
                                            {item?.selectedOption?.price}
                                          </del>
                                        </span>
                                      ) : (
                                        <span>
                                          {item?.selectedOption?.price}
                                        </span>
                                      )}
                                    </p>
                                  </div>

                                  <div className="text-[#414141] pt-1">
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
                                    {/* <p className="text-sm font-normal">
                                      <span>Color:</span>
                                      <span className="ml-2 text-[#807f7f]">
                                        {item?.selectedColor?.colorName || ""}
                                      </span>
                                      {item?.selectedColor ? (
                                        <span
                                          className="inline-block w-5 h-5 ml-2 border"
                                          style={{
                                            backgroundColor:
                                              item?.userChoiceColor,
                                          }}
                                        ></span>
                                      ) : (
                                        "Not specified"
                                      )}
                                    </p> */}
                                  </div>
                                </div>
                              </div>
                            </li>

                            <li className="w-[17%] text-base font-medium">
                              <div className="h-full flex flex-col items-start gap-1">
                                <div className="flex items-center justify-center w-20 h-12 relative border ">
                                  {item.quantity}
                                  <div className="absolute right-0">
                                    <IoIosArrowUp
                                      className="border w-6 h-6 cursor-pointer"
                                      onClick={() =>
                                        dispatch(
                                          incrementQuantity({
                                            id: item?._id,
                                            colorOptionId:
                                              item?.selectedOption._id,
                                            selectedSize: item?.selectedSize,
                                            maxStock: item?.selectedOption?.stock,
                                          })
                                        )
                                      }
                                    />

                                    <IoIosArrowDown
                                      className="border w-6 h-6 cursor-pointer"
                                      onClick={() =>
                                        dispatch(
                                          decrementQuantity({
                                            id: item?._id,
                                            colorOptionId:
                                              item?.selectedOption._id,
                                            selectedSize: item?.selectedSize,
                                          })
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                {item?.selectedOption?.stock !== undefined &&
                                  item.quantity >= item?.selectedOption?.stock && (
                                    <p className="text-[10px] text-orange-500 font-medium leading-tight">
                                      ⚠ Max stock reached ({item?.selectedOption?.stock} left)
                                    </p>
                                  )}
                              </div>
                            </li>

                            <li className="w-[17%] text-base font-medium">
                              <p className="flex items-center gap-x-1 text-red-500">
                                <span>৳</span>
                                <span>
                                  {(
                                    (item?.selectedOption?.discountValue > 0
                                      ? Math?.ceil(
                                        item?.selectedOption?.salePrice
                                      )
                                      : item?.selectedOption?.price) *
                                    item?.quantity
                                  ).toFixed(0)}
                                </span>
                              </p>
                            </li>

                            <li
                              className="w-[6%] text-xl px-2 text-danger hover:text-red-400 hover:scale-110 transition-all ease-linear font-medium cursor-pointer "
                              onClick={() =>
                                dispatch(
                                  deleteFromCart({
                                    id: item?._id,
                                    colorOptionId: item?.selectedOption?._id,
                                    selectedSize: item?.selectedSize,
                                  })
                                )
                              }
                            >
                              <MdDelete />
                            </li>
                          </ul>
                        ))}
                      </>
                    ) : (
                      <p>No items in the cart</p>
                    )}
                  </div>

                  <div className="p-5 xl:px-0">
                    <div>
                      <button
                        onClick={() => dispatch(resetCart())}
                        className="rounded px-5 py-1 border border-secendary bg-secendary text-base font-medium  duration-300 text-white hover:bg-red-700"
                      >
                        Reset Cart
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border h-52 relative mx-5">
                  <div className="grid grid-cols-2 border-b p-5">
                    <div className="flex justify-center gap-2">
                      <p>{totalItems}</p> items
                    </div>
                    <h3 className="text-sm tracking-wider flex items-center justify-center gap-x-0.5 text-red-500">
                      <span>৳</span>
                      {total.toFixed(0)}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 p-5">
                    <h3 className="flex justify-center items-center">Total</h3>
                    <h3 className="text-sm tracking-wider flex justify-center items-center gap-x-0.5 text-red-500">
                      <span>৳</span>
                      {total.toFixed(0)}
                    </h3>
                  </div>

                  <Link
                    to={"/checkout"}
                    className="absolute bottom-0 border btn btn-danger flex justify-center text-red-500 hover:bg-secendary items-center gap-x-3 py-3 hover:text-white w-full font-medium"
                  >
                    <HiOutlineShoppingBag className="text-xl" />
                    <span>Proceed to checkout</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20">
            <div className="flex justify-center items-center">
              <HiOutlineShoppingBag className="text-7xl" />
            </div>
            <h2 className="text-center text-lg font-medium mt-5">
              Your cart is currently empty.
            </h2>
            <div className="flex justify-center items-center mt-6 pb-10">
              <Link
                className="bg-texthead hover:bg-black transition-all ease-linear duration-200 font-medium px-5 py-2 text-white"
                to={"/shop"}
              >
                Return to shop
              </Link>
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default CartBox;
