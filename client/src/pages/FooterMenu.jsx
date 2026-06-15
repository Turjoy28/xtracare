import { useState, useEffect } from "react";
import { FaHome, FaShoppingCart, FaPhone } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { FiLogIn } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const FooterMenu = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const cartItems = useSelector((state) => state.cart.items);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      // Check if the user has scrolled past 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Check if the user has reached the bottom of the page
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight;
      setIsAtBottom(isBottom);

      if (isBottom) {
        setIsVisible(false); // Hide the footer when at the bottom of the page
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-secendary text-white flex justify-around items-center py-3 z-40 transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"
        } md:hidden`}
    >
      <div className="flex flex-col items-center">
        <FaHome size={22} />
        <Link to="/">
          <p className="text-xs mt-1">Home</p>
        </Link>
      </div>
      <div className="flex flex-col items-center">
        <FaShop size={22} />
        <Link to="/shop">
          <button className="text-xs mt-1">Shop</button>
        </Link>
      </div>
      <div className="flex flex-col items-center relative">
        <FaShoppingCart size={22} />
        <Link to={"/checkout"}>
          <p className="text-xs mt-1">Cart</p>
        </Link>
        <span className="absolute top-[-4px] right-[-4px] bg-[#fff] text-red-600 text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {totalQuantity}
        </span>
      </div>
    </div>
  );
};

export default FooterMenu;
