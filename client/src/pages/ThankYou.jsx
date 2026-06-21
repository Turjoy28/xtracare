import React, { useEffect } from "react";
import Containar from "../layouts/Containar";
import { Link, useLocation } from "react-router-dom";
import { LuChevronRight, LuHeartHandshake } from "react-icons/lu";
import { FaRegCircleCheck } from "react-icons/fa6";
import { MdOutlineMail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
const ThankYou = () => {
  const location = useLocation();
  const { data } = location.state || {};

  const { cartItems, calculateTotalCost, orderId } = data || {};

  useEffect(() => {
    window.scrollTo(0, 0);

    // Push to GTM Data Layer
    if (cartItems && calculateTotalCost && orderId) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "Purchase",
        transactionId: orderId,
        totalCost: calculateTotalCost,
        currency: "BDT",
        cartItems: cartItems?.map((item) => ({
          id: item?._id,
          name: item?.name,
          price: item?.selectedOption?.price,
          quantity: item?.quantity,
          size: item?.selectedOption?.size || "N/A",
          color: item?.selectedColor?.colorName || "N/A",
        })),
      });
    } else {
      console.error("Missing required data for tracking.");
    }

    // Reload Logic
    if (!sessionStorage.getItem("hasReloaded")) {
      const timer = setTimeout(() => {
        window.location.reload();
        sessionStorage.setItem("hasReloaded", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cartItems, calculateTotalCost, orderId]);

  return (
    <div className="font-inter">
      <div>
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
                to={"/"}
              >
                Thank You
              </Link>{" "}
            </h4>
          </div>
        </section>

        <div>
          <Containar>
            <div className="py-20">
              <h2 className="text-[100px] flex items-center justify-center  font-medium text-center text-green-600">
                <FaRegCircleCheck />
              </h2>
              <h2 className="text-2xl mt-10 text-texthead font-medium text-center">
                Thank you!
              </h2>
              <h2 className="text-3xl mt-7 text-green-500 font-medium text-center">
                Your order has been completed.
              </h2>
              <h4 className="text-base mt-5 text-center">
                For order-related inquiries, please contact us.
              </h4>
              <h4 className="text-lg mt-5 text-center flex justify-center text-green-500">
                <Link
                  to={"tel:-01755599108"}
                  className="flex items-center gap-x-2"
                >
                  <FaPhoneAlt /> +8801577498985
                </Link>
              </h4>
              <h4 className="text-base mt-5 text-center flex justify-center text-texthead">
                <Link
                  to={"mailto:sahanazmoni.sm@gmail.com"}
                  className="flex items-center gap-x-2"
                >
                  <MdOutlineMail /> sahanazmoni.sm@gmail.com
                </Link>
              </h4>
              <p className="text-center mt-5">You can buy more products.</p>
              <div className="mt-5 flex justify-center">
                <Link
                  to={"/shop"}
                  className=" text-center  inline-block cursor-pointer py-2 px-6 bg-texthead text-white"
                >
                  return shop
                </Link>
              </div>
            </div>
          </Containar>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
