import about from "../../assets/banner/newAbout.webp";
import BradCumbs from "../bradcumbs/BradCumbs";

const AboutBanner = () => {
  return (
    <div className="w-full h-60 relative">
      <BradCumbs
        // title={"About Us"}
        className="absolute text-white left-[30%] top-20"
      />
      <img className="w-full h-full object-cover" src={about} />
    </div>
  );
};

export default AboutBanner;
