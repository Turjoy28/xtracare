// import React, { useState, useEffect, useContext } from "react";
// import { Link } from "react-router-dom";
// import { FaBangladeshiTakaSign } from "react-icons/fa6";
// import ApiContext from "../baseapi/BaseApi";
// import axios from "axios";
import { FaCheck } from "react-icons/fa6";
import { FaThumbsUp } from "react-icons/fa6";
import { FaHandshake } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { FaPhoneAlt } from "react-icons/fa";

const RightPartProduct = () => {
  // const [productList, setProductList] = useState([]);
  // const [error, setError] = useState(null);
  // const baseApi = useContext(ApiContext);

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const response = await axios.get(`${baseApi}/option`);
  //       const fetchedProducts = response.data.data.doc.reverse(); // Adjust according to API response structure

  //       // Remove duplicates based on product ID
  //       const uniqueProducts = [];
  //       const seenProductIds = new Set();
  //       fetchedProducts.forEach((item) => {
  //         if (!seenProductIds.has(item.product._id)) {

  //           seenProductIds.add(item.product._id);
  //           uniqueProducts.push(item);
  //         }
  //       });

  //       // Set the product list with unique products
  //       setProductList(uniqueProducts);
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //       setError("Error fetching products. Please try again later.");
  //     }
  //   };

  //   fetchProducts();
  // }, [baseApi]);

  return (
    // <ul
    //   onClick={() => {
    //     window.scrollTo(0, 0);
    //     window.location.reload();
    //   }}
    //   className="flex flex-wrap justify-between xl:block px-5 xl:px-0"
    // >
    //   {/* {error && <li>{error}</li>} */}
    //   {productList.length === 0 ? (
    //     <li>No products available</li>
    //   ) : (
    //     productList.slice(0, 4).map((item) => (
    //       <Link
    //         key={item.id}
    //         className="flex w-full gap-x-2  xl:gap-x-4  py-5 hover:bg-gray-100"
    //       >
    //         <Link
    //           to={`/productdetail/${item?.product?.name
    //             ?.toLowerCase()
    //             .replace(/\s+/g, "-")}/${item?.product?._id}`}
    //           className="w-[20%]"
    //         >
    //           <img
    //             className="w-full  object-contain"
    //             src={item?.product?.photos[0] || []}
    //             alt={item?.title || "Product Image"}
    //           />
    //         </Link>
    //         <div className="w-[70%] flex items-center">
    //           <div>
    //             <Link
    //               to={`/productdetail/${item?.product?.name
    //                 ?.toLowerCase()
    //                 .replace(/\s+/g, "-")}/${item?.product?._id}`}
    //               className="text-[12px] xl:text-sm font-normal block -pt-1 text-texthead Truncate overflow-hidden"
    //             >
    //               {item?.product?.name}
    //             </Link>
    //             <div className="flex gap-x-0.5 items-center text-base mt-2">
    //               {item?.salePrice > 0 ? (
    //                 <div className="flex gap-x-3">
    //                   <div className="flex text-sm items-center gap-x-1 text-red-500">
    //                     ৳ {item.salePrice}
    //                   </div>
    //                   <div className="flex text-xs items-center gap-x-0.5 line-through ">
    //                     ৳ {item.price}
    //                   </div>
    //                 </div>
    //               ) : (
    //                 <div className="flex text-sm items-center gap-x-1 text-red-500">
    //                   ৳ {item.price}
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         </div>
    //       </Link>
    //     ))
    //   )}
    // </ul>
    <div className="my-12 flex flex-col gap-6">
      <div className="border border-dashed border-[#262626] p-5">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2">
            <span>
              <FaCheck />
            </span>
            Order today and receive it within 01 - 02 days
          </p>
          <p className="flex items-center gap-2">
            <span>
              <FaThumbsUp />
            </span>
            Quality Product
          </p>
          <p className="flex items-center gap-2">
            <span>
              <FaHandshake />
            </span>
            Cash On Delivery Available
          </p>
          <p className="flex items-center gap-2">
            <span>
              <TbTruckDelivery />
            </span>
            Delivery Charge Inside Dhaka 70TK
          </p>
          <p className="flex items-center gap-2">
            <span>
              <TbTruckDelivery />
            </span>
            Delivery Charge Outside Dhaka 140TK
          </p>
        </div>
      </div>

      <div className="border border-dashed border-[#262626] p-4 ">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg">
            Have any question about this product? please call
          </h2>
          <p className="flex items-center gap-2">
            <span>
              <FaPhoneAlt />
            </span>
            01930414944
          </p>
          <p className="flex items-center gap-2">
            <span className="">
              <FaPhoneAlt />
            </span>
            <span>01930414944</span>
            <span className="px-1 border border-dashed border-[red] text-[red]">
              Bkash Personal
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span>
              <FaPhoneAlt />
            </span>
            <span>01930414944</span>
            <span className="px-1 border border-dashed border-[#F7941D] text-[#F7941D]">
              Nagad Personal
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RightPartProduct;
