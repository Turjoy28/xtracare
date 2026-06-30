import { useContext, useEffect, useRef, useState } from "react";

import { IoSearch } from "react-icons/io5";
import logo from "../../../assets/logos/main-logo.png";
import { IoClose } from "react-icons/io5";
import ApiContext from "../../baseapi/BaseApi";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { MdArrowRightAlt } from "react-icons/md";
import { useSelector } from "react-redux";
import { FiShoppingBag } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";

const NavBarMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const navbarRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({});
  const [categoryActive, setCategoryActive] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpen, setIsOpen] = useState(false);

  const cartItems = useSelector((state) => state.cart.items);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // ###### Search START ########
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showList, setShowList] = useState(false);
  const baseApi = useContext(ApiContext);
  const searchRef = useRef();
  const mobileSearchRef = useRef(null);

  const fetchProducts = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/search`, {
        params: { query },
      });
      const variants = response.data?.data?.products || [];
      setProducts(variants);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search.length > 0) {
      fetchProducts(search);
      setShowList(true);
    } else {
      setProducts([]);
      setShowList(false);
    }
  }, [search]);

  useEffect(() => {
    setFilteredProducts(
      products
        .filter((product) => product?.variants[0]?.options[0]?.price > 0)
        .filter((product) => {
          const searchTerm = search.toLowerCase();
          const searchFields = [
            product?.name,
            product?.category?.title,
            product?.subCategory?.title,
            product?.childCategory?.title,
          ];
          return searchFields.some(
            (field) => field && field.toLowerCase().includes(searchTerm)
          );
        })
    );
  }, [products, search]);

  const handleProductClick = () => {
    setSearch("");
    setShowList(false);
  };

  const handleSearchButton = () => {
    setSearch("");
    setShowSearch(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && !searchRef.current.contains(event.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(event.target) // <-- Mobile check jog holo
      ) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearch("");
    setShowList(false);
    setShowSearch(false);
  }, [location.pathname]);

  // Disable scroll when the search bar is open
  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSearch]);

  // ###### Search END ########

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  // ###### Menu List START ########
  const menuItems = [
    windowWidth > 768 && {
      name: "Categories",
      onClick: toggleDrawer,
    },
    { name: "Shop", link: "/shop", highlight: false },
    { name: "About", link: "/about" },
    { name: "Contact Us", link: "/contact" },
  ];

  // ###### Menu List END ########

  const setHandleClick = (id) => {
    const selectedCategory = categories.find(cat => cat._id === id);
    if (selectedCategory) {
      setData(selectedCategory);
      setCategoryActive(true);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth]);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const categoryRes = await axios.get(`${baseApi}/category`);
        const categoriesFromApi = categoryRes?.data?.data?.doc || [];

        const subCategoryRes = await axios.get(`${baseApi}/subCategory`);
        const subCategoriesFromApi = subCategoryRes?.data?.data?.doc || [];

        const childCategoryRes = await axios.get(`${baseApi}/childCategory`);
        const childCategoriesFromApi = childCategoryRes?.data?.data?.doc || [];

        const childBySubId = new Map();
        childCategoriesFromApi.forEach((child) => {
          const subId = child?.subCategory?._id || child?.subCategory;
          if (!subId) return;
          if (!childBySubId.has(subId)) childBySubId.set(subId, []);
          childBySubId.get(subId).push({
            _id: child._id,
            title: child.title,
          });
        });

        const subByCatId = new Map();
        subCategoriesFromApi.forEach((sub) => {
          const catId = sub?.category?._id || sub?.category;
          if (!catId) return;
          if (!subByCatId.has(catId)) subByCatId.set(catId, []);
          subByCatId.get(catId).push({
            _id: sub._id,
            title: sub.title,
            childCategories: childBySubId.get(sub._id) || [],
          });
        });

        const merged = categoriesFromApi.map((cat) => ({
          _id: cat._id,
          title: cat.title,
          subCategories: subByCatId.get(cat._id) || [],
        }));

        setCategories(merged);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load header category hierarchy:", err);
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, [baseApi]);

  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        const top = navbarRef.current.getBoundingClientRect().top;
        setIsSticky(top <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  return (
    <>
      <div
        open={isOpen}
        // onClose={toggleDrawer}
        direction="left"
        size={windowWidth > 400 ? 400 : 300}
        // lockBackgroundScroll={true}
        className={`w-[275px] lg:w-[350px] transition-transform duration-300 ease-in-out fixed z-50 top-0 bg-white h-screen ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="font-inter h-screen overflow-scroll ">
          <div className="py-4 px-7 flex justify-between items-center shadow">
            <Link className="flex items-baseline" to="/">
              <div className="flex gap-2 items-center ">
                <img className="w-28" src={logo} />
              </div>
            </Link>
            <div onClick={() => toggleDrawer()}>
              <IoClose className="text-2xl cursor-pointer text-red-500" />
            </div>
          </div>

          {/* show categories in left side drawer */}
          <div className="border-t border-t-border ">
            <ul className=" flex  flex-col min-h-[500px] relative overflow-hidden">
              {categories.map((category) => (
                <li
                  className="py-3.5 border-b px-7 cursor-pointer hover:bg-bestdealbg transition-all ease-linear duration-300 flex items-center justify-between "
                  key={category._id}
                  onClick={() => setHandleClick(category._id)}
                >
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm md:text-base font-medium  text-texthead ">
                      {category?.title}
                    </h4>
                  </div>
                  <h4>
                    <MdArrowRightAlt className="text-xl text-gray-400 font-thin" />
                  </h4>
                </li>
              ))}
              <li
                className={`absolute ${categoryActive ? "left-0" : "left-full "
                  }   transition-all  duration-300 ease-in-out top-0 w-full min-h-[500px] bg-white z-20`}
              >
                <div>
                  <h4
                    onClick={() => setCategoryActive(false)}
                    className="font-medium py-3.5 px-7 text-sm md:text-base text-texthead flex gap-x-2 items-center cursor-pointer bg-bestdealbg"
                  >
                    <span>
                      <MdArrowRightAlt className="text-xl rotate-180 text-gray-400" />
                    </span>
                    {data?.title}
                  </h4>
                  <ul className="mt-3">
                    {data?.subCategories?.map((item, index) => {
                      return (
                        <li
                          className="border-b transition-all ease-linear duration-200"
                          key={item._id || index}
                        >
                          <div className="hover:bg-bestdealbg hover:bg-opacity-60">
                            <Link
                              onClick={() => {
                                toggleDrawer();
                                setCategoryActive(false);
                              }}
                              className="py-3.5 px-9 inline-block w-full"
                              to={`/shop/subcategory/${item?._id
                                }/${encodeURIComponent(
                                  item?.title.replace(/\s+/g, "")
                                )}`}
                            >
                              {item?.title}
                            </Link>
                          </div>
                          {item?.childCategories?.length > 0 && (
                            <ul className="pl-12 bg-gray-50 pb-2">
                              {item.childCategories.map((child) => (
                                <li key={child._id} className="pt-2">
                                  <Link
                                    onClick={() => {
                                      toggleDrawer();
                                      setCategoryActive(false);
                                    }}
                                    to={`/shop?childcategory=${child._id}`}
                                    className="block text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                                  >
                                    - {child.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <nav
        ref={navbarRef}
        className={`sticky top-0 z-30 bg-[#215578] transition-all duration-200 ${isSticky ? "" : "border-none"
          }`}
      >
        <section className="flex justify-between items-center  max-w-screen-xl mx-auto px-5 2xl:px-0">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-xl text-white" onClick={toggleDrawer}>
              ☰
            </button>
          </div>
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2 py-1 lg:py-4">
            <img src={logo} alt="company_logo" className="w-20 lg:w-24" /> <h1 className="text-xl lg:text-2xl font-semibold text-white">Xtra Care</h1>
          </Link>

          {/* Desktop Search (inline) */}
          <div className="hidden sm:flex items-center justify-center flex-1 px-4">
            <div className="relative w-full max-w-[520px]" ref={searchRef}>
              <input
                type="text"
                name="searchBar"
                placeholder="Search your products..."
                className="w-full bg-[#F7F7F7] text-gray-950 outline-none border border-gray-300 rounded-lg px-4 py-2.5 pr-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Search">
                <IoSearch className="text-2xl text-gray-700" />
              </button>

              {search && showList && (
                <ul
                  className="absolute left-0 right-0 top-[46px] z-50 bg-gray-100 shadow-md mt-2 h-[340px] overflow-y-auto"
                  onClick={handleProductClick}
                >                  <div className="flex flex-col gap-2 p-4">
                    {filteredProducts.length > 0
                      ? filteredProducts.map((product, index) => (
                        <li
                          key={index}
                          className="border-b border-gray-200 last:border-0 hover:bg-gray-100 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            to={`/productdetail/${encodeURIComponent(
                              product?.name.replace(/\\s+/g, "")
                            )}/${product._id}`}
                            onClick={handleProductClick}
                            className="flex items-center gap-4 px-2 py-2"
                          >
                            <div className="w-14 h-14 flex-shrink-0 bg-white border rounded">
                              <img
                                className="w-full h-full object-cover rounded"
                                src={product?.photos[0]}
                                alt={product?.title}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                {product?.name}
                              </h3>
                              <p className="flex items-center gap-x-1 mt-1 font-semibold text-red-500">
                                <span className="text-sm">৳</span>
                                <span className="text-sm">
                                  {product?.variants[0]?.options[0]?.price}
                                </span>
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))
                      : !loading && (
                        <li className="px-4 py-3 text-center text-gray-500">No products found</li>
                      )}
                  </div>
                </ul>
              )}
            </div>
          </div>


          {/* Icons */}
          <div className="flex items-center justify-center space-x-4">
            <button
              className="text-2xl text-white sm:hidden"
              onClick={() => setShowSearch(!showSearch)}
            >
              <IoSearch />
            </button>

            <h1 className="text-white text-lg hidden md:block"> 📞 01577498985</h1>

            <Link to={"/checkout"} className="hidden md:flex items-center relative">
              <FaShoppingCart size={22} className="text-white" />
              <span className="absolute top-[-4px] right-[-4px] bg-[#fff] text-red-600 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {totalQuantity}
              </span>
            </Link>
          </div>
        </section>
        <div ref={mobileSearchRef}>
          {/* -top-10 lg:-top-12 */}
          {showSearch && (
            <div
              className={`absolute top-0 left-0 w-full bg-white p-4 shadow-md  h-40 z-[100] ${showSearch ? "animate-slideDown" : "animate-slideUp"
                }`}
            >
              <p className="text-center text-base lg:text-xl py-4">
                Search your products
              </p>
              <div className="flex items-center max-w-lg mx-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 border border-gray-300 rounded-lg p-2 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button
                className="absolute right-5 top-2"
                onClick={handleSearchButton}
              >
                <IoClose className="text-4xl hover:text-red-500 duration-200 scale-105" />
              </button>
            </div>
          )}
          {search && showList && (
            <ul
              className="absolute top-36 w-full z-[100] bg-gray-100 shadow-md mt-2 h-screen overflow-y-auto sm:hidden block"
              onClick={handleSearchButton}
            >
              <div className="flex flex-col gap-2 p-4">
                {filteredProducts.length > 0
                  ? filteredProducts.map((product, index) => (
                    <li
                      key={index}
                      className="bg-white border-b border-gray-200 last:border-0 hover:bg-gray-50 cursor-pointer rounded shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        to={`/productdetail/${encodeURIComponent(
                          product?.name.replace(/\\s+/g, "")
                        )}/${product._id}`}
                        onClick={() => {
                          setTimeout(() => {
                            handleProductClick();
                            handleSearchButton();
                          }, 150);
                        }}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <div className="w-16 h-16 flex-shrink-0 border rounded">
                          <img
                            className="w-full h-full object-cover rounded"
                            src={product?.photos[0]}
                            alt={product?.title}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                            {product?.name}
                          </h3>
                          <p className="flex items-center gap-x-1 mt-1 font-semibold text-red-500">
                            <span className="text-sm">৳</span>
                            <span className="text-sm">
                              {product?.variants[0]?.options[0]?.price}
                            </span>
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))
                  : !loading && (
                    <li className="px-4 py-3 text-center text-gray-500">No products found</li>
                  )}
              </div>
            </ul>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBarMain;
