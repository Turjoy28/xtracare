import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import ApiContext from "../../baseapi/BaseApi";
import axios from "axios";

const BottomHeader = () => {
  // ৩টি লেভেলের হোভার ট্র্যাক করার জন্য ৩টি স্টেট
  const [activeCatId, setActiveCatId] = useState(null);
  const [activeSubCatId, setActiveSubCatId] = useState(null);

  const [categories, setCategories] = useState([]);
  const baseApi = useContext(ApiContext);


  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        // keep effect side-effect limited to building the hierarchy

        // Level 1: Category
        const categoryRes = await axios.get(`${baseApi}/category`);
        const categoriesFromApi = categoryRes?.data?.data?.doc || [];

        // Level 2: SubCategory
        const subCategoryRes = await axios.get(`${baseApi}/subCategory`);
        const subCategoriesFromApi = subCategoryRes?.data?.data?.doc || [];

        // Level 3: ChildCategory
        const childCategoryRes = await axios.get(`${baseApi}/childCategory`);
        const childCategoriesFromApi =
          childCategoryRes?.data?.data?.doc || [];

        // Build: category -> subCategories -> childCategories
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
      } catch (err) {
        console.error("Failed to load header category hierarchy:", err);
      }
    };

    fetchHierarchy();
  }, [baseApi]);

  // মাউস মেইন ক্যাটাগরি থেকে বের হয়ে গেলে সব ড্রপডাউন বন্ধ করার জন্য
  const handleMainMenuLeave = () => {
    setActiveCatId(null);
    setActiveSubCatId(null);
  };

  return (
    <header className="bg-[#F2F1F0] text-gray-800 py-3 hidden lg:block">
      <section className="max-w-screen-xl mx-auto xl:px-5 px-0 2xl:px-0">
        <div className="flex items-center justify-center gap-6 w-full">

          {categories?.map((category) => {
            const isCatOpen = activeCatId === category._id;

            return (
              <div
                key={category._id}
                className="relative inline-block text-left"
                onMouseEnter={() => setActiveCatId(category._id)}
                onMouseLeave={handleMainMenuLeave}
              >
                {/* লেভেল ১: মেইন ক্যাটাগরি */}
                <Link to={`/shop/category/${category._id}/${encodeURIComponent(category.title?.replace(/\\s+/g, "") || "category")}`} className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  {category?.title}
                  {category?.subCategories?.length > 0 && (
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isCatOpen ? "rotate-180" : ""}`} />
                  )}
                </Link>

                {/* লেভেল ২: সাব-ক্যাটাগরি */}
                {isCatOpen && category?.subCategories?.length > 0 && (
                  <div className="absolute left-0 mt-0 w-52 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {category.subCategories.map((subCategory) => {
                        const isSubCatOpen = activeSubCatId === subCategory._id;

                        return (
                          <div
                            key={subCategory._id}
                            className="relative"
                            onMouseEnter={() => setActiveSubCatId(subCategory._id)}
                            onMouseLeave={() => setActiveSubCatId(null)}
                          >
                            <Link
                              to={`/shop/subcategory/${subCategory._id}/${encodeURIComponent(subCategory.title?.replace(/\\s+/g, "") || "subcategory")}`}
                              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            >
                              <span>{subCategory.title}</span>
                              {subCategory?.childCategories?.length > 0 && (
                                <ChevronRightIcon className="w-4 h-4" />
                              )}
                            </Link>

                            {/* লেভেল ৩: চাইল্ড ক্যাটাগরি (ডান পাশে পপ-আপ হবে) */}
                            {isSubCatOpen && subCategory?.childCategories?.length > 0 && (
                              <div className="absolute left-full top-0 mt-0 w-52 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                <div className="py-1">
                                  {subCategory.childCategories.map((childCategory) => (
                                    <Link
                                      key={childCategory._id}
                                      to={`/shop?childcategory=${childCategory._id}`}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                                    >
                                      {childCategory.title}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </section>
    </header>
  );
};

export default BottomHeader;
