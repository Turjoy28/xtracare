import React from "react";
import Containar from "../../layouts/Containar";
import { FaChevronRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const CartBradCumbs = () => {
  const navigate = useNavigate();
  return (
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
              Cart
            </Link>{" "}
          </h4>
        </div>
      </section>
    </section>
  );
};

export default CartBradCumbs;
