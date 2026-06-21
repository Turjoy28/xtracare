import React, { useEffect } from "react";
import Containar from "../layouts/Containar";
import { Link } from "react-router-dom";
import { LuChevronRight, LuHome } from "react-icons/lu";

const NotFound = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="font-inter">
      <div className="border-b border-b-border">
        <Containar>
          <h3 className="flex gap-x-2 py-5 items-center text-sm text-texthead">
            <Link className="inline-block hover:text-customRed transition-colors" to={"/"}>
              Home
            </Link>{" "}
            <span>
              <LuChevronRight className="text-sm" />
            </span>{" "}
            <span className="text-gray-500">
              Error 404
            </span>
          </h3>
        </Containar>
      </div>
      <Containar>
        <div className="py-24 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <h2 className="text-[150px] md:text-[200px] leading-none text-gray-100 font-bold text-center select-none">
              404
            </h2>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-3xl md:text-5xl text-texthead font-bold text-center capitalize drop-shadow-md">
                Page Not Found
              </h2>
            </div>
          </div>
          <p className="text-center mt-6 text-paracolor text-lg max-w-lg">
            Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to={"/"}
              className="flex items-center gap-2 py-3 px-8 bg-[#215578] hover:bg-opacity-90 text-white rounded-full transition-all ease-linear duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <LuHome className="text-xl" />
              Back to Home
            </Link>
          </div>
          <p className="text-center mt-12 text-sm text-paracolor">
            Developed by <span className="font-medium"><Link target="_blank" to={"https://www.okobiz.com/"} className="hover:text-primary transition-colors">okobiz</Link></span>
          </p>
        </div>
      </Containar>
    </div>
  );
};

export default NotFound;
