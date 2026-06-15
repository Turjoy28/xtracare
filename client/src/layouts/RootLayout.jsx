import React, { useEffect, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/shared/header/Header";
import Footer from "../components/shared/footer/Footer";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import FixedCart from "../components/floatcart/FixedCart";
import MessengerBtn from "../components/MessengerBtn";
import FooterMenu from "../pages/FooterMenu";
import { useState } from "react";
import loader from "../assets/loader/loader.json";
import Lottie from "react-lottie";

const RootLayout = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loader,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  return (
    <div className="font-inter">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen bg-[#fff] z-[999] fixed w-full">
          <div className="w-[50%] h-[50%] lg:w-[10%] lg:h-[10%] md:w-[30%] md:h-[30%]">
            <Lottie options={defaultOptions} />
          </div>
        </div>
      ) : (
        <Theme>
          <div className="fixed right-5 bottom-20 z-40">
            <MessengerBtn />
          </div>

          {location.pathname != "/cart" && <FixedCart />}
          <Header />
          {/* Suspense with a Loader */}
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-screen">
                <div className="rounded-full h-20 w-20 bg-violet-800 animate-ping"></div>
              </div>
            }
          >
            <Outlet />
            <Footer />
            <FooterMenu />
          </Suspense>
        </Theme>
      )}
    </div>
  );
};

export default RootLayout;
