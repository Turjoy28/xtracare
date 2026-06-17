import React, { useEffect } from "react";
import Banner from "../components/home/Banner";
import Feature from "../components/home/Feature";
import BestSell from "../components/home/BestSell";
import SaleFeature from "../components/home/SaleFeature";
import Brand from "../components/home/Brand";
import BundlePackages from "../components/home/BundlePackages";
import NewArival from "../components/home/NewArival";

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Banner />
      <Feature />
      <NewArival />
      <BestSell />
      {/* <BundlePackages /> */}
      <SaleFeature />
      <Brand />
    </>
  );
};

export default Home;
