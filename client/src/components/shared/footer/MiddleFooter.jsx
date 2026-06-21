import React, { useContext, useEffect, useState } from "react";
import Containar from "../../../layouts/Containar";
import { socialList } from "../../constants";
import { Link } from "react-router-dom";
import ApiContext from "../../baseapi/BaseApi";
import axios from "axios";
import logo from "../../../assets/logos/main-logo.png";
const MiddleFooter = () => {
  const [categories, setCategories] = useState([]);

  const accountList = [
    {
      name: "Privacy Policy",
      link: "/privacy",
    },
    {
      name: "Refunds Policy",
      link: "/refund-replace",
    },
    {
      name: "Delivery policy",
      link: "/delivery-info",
    },
    {
      name: "Terms & Condition",
      link: "/terms-condition",
    },
  ];
  const baseApi = useContext(ApiContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseApi}/category`);
        setCategories(response.data.data.doc); // Assuming response.data contains the array of categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className=" bg-[#215578] px-10">
      <Containar>
        <div className="w-full flex justify-between flex-wrap py-10 gap-10 md:gap-0">
          <div className="w-full md:w-1/3">
            <Link className="flex items-baseline" to="/">
              <div className="flex gap-2 items-center text-white rounded p-2">
                <img className="w-28" src={logo} />
              </div>
            </Link>
            <ul className="mt-3 flex flex-col gap-y-4 list-disc custom-list">
              {accountList.map((item, index) => (
                <li key={index} className="">
                  <Link
                    to={item?.link}
                    className="text-base text-white hover:pl-1.5 cursor-pointer transition-all ease-linear duration-200 hover:text-gray-50 inline-block"
                  >
                    {item?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/3 pr-14">
            <h3 className="text-base md:text-lg text-white font-semibold uppercase">
              Shop Categories
            </h3>
            <ul className="mt-4 flex flex-col gap-y-4 list-disc custom-list overflow-y-auto min-h-40 max-h-40 scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-[#444444] hover:scrollbar-thumb-opacity-100 hover:scrollbar-track-opacity-100 scrollbar-thumb-opacity-0 scrollbar-track-opacity-0 transition-all">
              {categories.map((item, index) => (
                <li key={index}>
                  <Link
                    to={`/shop/category/${item?._id}/${encodeURIComponent(
                      item?.title.replace(/\s+/g, "")
                    )}`}
                    className="text-base hover:pl-1.5 cursor-pointer text-white transition-all ease-linear duration-200 inline-block"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full md:w-1/3">
            <div className="w-full">
              <h3 className="text-base md:text-lg text-white font-semibold uppercase">
                Contacts
              </h3>
              <div className="mt-4">
                <p className="text-white font-bold underline">Address</p>
                <p className="text-white">
                  Ashkona, Hazi school road, Dakshinkhan, Dhaka 1230
                </p>
                <p className="text-white font-bold underline">Phone</p>
                <a className="text-white" href="tel:+01755599108">
                  +8801577498985
                </a>
                <p className="text-white font-bold underline">Email</p>
                <a className="text-white" href="mailto:sahanazmoni.sm@gmail.com">
                  sahanazmoni.sm@gmail.com
                </a>
                <ul className="flex items-center gap-x-5 mt-5">
                  {socialList.map((item, index) => {
                    let Icon = item.logo;
                    const bgColor =
                      item.name === "facebook"
                        ? "bg-[#3b5998] hover:bg-opacity-70 text-white"
                        : item.name === "linkedIn"
                          ? "bg-[#0A66C2] hover:bg-opacity-70 text-white"
                          : item.name === "twitter"
                            ? "bg-[#ffffff] hover:bg-opacity-70 text-black hover:text-black"
                            : "";
                    return (
                      <a
                        key={index}
                        className="text-texthead"
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <li
                          className={`w-8 h-8 rounded-full flex items-center justify-center  ${bgColor} transition-all ease-linear duration-200 hover:text-white`}
                          key={index}
                        >
                          <Icon />
                        </li>
                      </a>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Containar>
    </div>
  );
};

export default MiddleFooter;
