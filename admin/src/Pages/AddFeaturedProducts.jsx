// import React, { useState, useEffect } from "react";
// import { Table, Modal, Input, Button, Checkbox } from "antd";
// import axios from "../Components/Axios";
// import { toast } from "react-toastify";

// const AddFeaturedProducts = () => {
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedItems, setSelectedItems] = useState(new Set());
//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [featuredProductsModal, setFeaturedProductsModal] = useState(false);

//   const fetchData = async () => {
//     try {
//       const response = await axios.get("/product");
//       const featuredResponse = await axios.get("/featuredProduct");

//       const allProducts = response.data.data.allProduct || [];
//       const allFeatured = featuredResponse.data.data.allFeaturedProduct || [];

//       const productData = allProducts.map((product, index) => ({
//         ...product,
//         key: product?._id,
//         index: index + 1,
//         name: product?.name || "N/A",
//         category: product?.category?.title || "N/A",
//         subCategory: product?.subCategory?.title || "N/A",
//         photos: product?.photo || [],
//         isFeaturedProduct: allFeatured.some(
//           (featured) => featured.productRef?._id === product._id
//         ),
//       }));

//       setData(productData.reverse());
//       setFilteredData(productData.reverse());

//       const featuredData = productData.filter((product) => product.isFeaturedProduct);
//       setFeaturedProducts(featuredData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error("Failed to fetch products.");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleSearch = () => {
//     const trimmedSearch = searchTerm.trim().toLowerCase();
//     if (!trimmedSearch) {
//       setFilteredData(data);
//       return;
//     }

//     const filtered = data.filter(
//       (item) =>
//         item?.name?.toLowerCase().includes(trimmedSearch) ||
//         item?.category?.toLowerCase().includes(trimmedSearch) ||
//         item?.subCategory?.toLowerCase().includes(trimmedSearch)
//     );

//     setFilteredData(filtered);
//   };

//   const sendApiRequest = async (id) => {
//     try {
//       const response = await axios.post("/featuredProduct", { productRef: id });
//       fetchData();
//       // toast.success(response?.data?.message || "Updated successfully!", {
//       //   position: "top-right",
//       //   autoClose: 3000,
//       // });

//     } catch (error) {
//       console.error("Error updating featured status:", error);
//       toast.error("Failed to update.");
//     }
//   };

//   const columns = [
//     {
//       title: "#SL",
//       dataIndex: "index",
//       key: "index",
//       width: "7%",
//     },
//     {
//       title: "Category",
//       dataIndex: "category",
//       key: "category",
//       width: "8%",
//     },
//     {
//       title: "Sub Category",
//       dataIndex: "subCategory",
//       key: "subCategory",
//       width: "8%",
//     },
//     {
//       title: "Title",
//       dataIndex: "name",
//       key: "title",
//       width: "20%",
//     },
//     {
//       title: "Images",
//       dataIndex: "photos",
//       key: "photos",
//       width: "10%",
//       render: (photos) =>
//         photos && photos.length > 0 ? (
//           <div style={{ display: "flex", gap: "5px" }}>
//             {photos.map((url, index) => (
//               <img
//                 key={index}
//                 src={url}
//                 alt={`Image ${index + 1}`}
//                 style={{ width: "50px", height: "50px", objectFit: "cover" }}
//               />
//             ))}
//           </div>
//         ) : (
//           "N/A"
//         ),
//     },
//     {
//       title: "Price",
//       dataIndex: "variants",
//       key: "price",
//       render: (variants) =>
//         variants && variants.length > 0 ? (
//           variants.map((variant, index) =>
//             variant.options?.map((option, optionIndex) => (
//               <div key={`${index}-${optionIndex}`}>
//                 {option.price ? `${option.price} TK` : "N/A"}
//               </div>
//             ))
//           )
//         ) : (
//           "N/A"
//         ),
//     },
//     {
//       title: "Action",
//       key: "action",
//       width: "10%",
//       render: (item) => (
//         <Checkbox
//           checked={selectedItems.has(item.key) || item.isFeaturedProduct}
//           onChange={(e) => {
//             const isChecked = e.target.checked;

//             setSelectedItems((prev) => {
//               const newSet = new Set(prev);
//               isChecked ? newSet.add(item.key) : newSet.delete(item.key);
//               return newSet;
//             });

//             sendApiRequest(item._id, isChecked);
//           }}
//         >
//           {item.isFeaturedProduct ? "Featured" : "Not Featured"}
//         </Checkbox>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div className="flex justify-between items-center px-5 my-4">
//         <div className="flex space-x-3">
//           <Input
//             placeholder="Search by Product Title, Category or SubCategory Name"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{ width: 400 }}
//           />
//           <Button type="primary" onClick={handleSearch}>
//             Search
//           </Button>
//         </div>
//         <Button className="bg-blue-500 text-white" onClick={() => setFeaturedProductsModal(true)}>
//           All Featured Products
//         </Button>
//       </div>

//       <Table columns={columns} dataSource={filteredData} scroll={{ x: 1300 }} />

//       <Modal
//         title="All Featured Products"
//         open={featuredProductsModal}
//         onCancel={() => setFeaturedProductsModal(false)}
//         footer={null}
//         width={1000}
//       >
//         <Table
//           dataSource={featuredProducts}
//           columns={[
//             { title: "Name", dataIndex: "name", key: "name" },
//             { title: "Category", dataIndex: "category", key: "category" },
//             { title: "Sub Category", dataIndex: "subCategory", key: "subCategory" },
//             {
//               title: "Images",
//               dataIndex: "photos",
//               key: "photos",
//               render: (photos) =>
//                 photos && photos.length > 0 ? (
//                   <div style={{ display: "flex", gap: "8px" }}>
//                     {photos.map((photo, index) => (
//                       <img
//                         key={index}
//                         src={photo}
//                         alt={`Image ${index + 1}`}
//                         style={{ width: "50px", height: "50px", objectFit: "cover" }}
//                       />
//                     ))}
//                   </div>
//                 ) : (
//                   "N/A"
//                 ),
//             },
//           ]}
//           rowKey="id"
//           pagination={{ pageSize: 5 }}
//         />
//       </Modal>
//     </div>
//   );
// };

// export default AddFeaturedProducts;

import React, { useState, useEffect } from "react";
import {
  Space,
  Popconfirm,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Upload,
  Checkbox,
} from "antd";
import axios from "../Components/Axios";
import "react-quill/dist/quill.snow.css";

import { toast } from "react-toastify";

const AddFeaturedProducts = () => {
  const [data, setData] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [FeaturedProductsForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [fileList, setFileList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [FeaturedProducts, setFeaturedProducts] = useState([]);
  const [FeaturedProductsModal, setFeaturedProductsModal] = useState(false);

  const showFeaturedProductsModal = () => setFeaturedProductsModal(true);
  const handleFeaturedProductsCancel = () => setFeaturedProductsModal(false);

  const FeaturedProductsColumns = [
    {
      title: "FeaturedProducts Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Sub Category",
      dataIndex: "subCategory",
      key: "subCategory",
    },

    {
      title: "Images",
      dataIndex: "photos",
      key: "photos",
      width: "30%",
      render: (photos) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {photos?.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`FeaturedProducts Image ${index + 1}`}
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          ))}
        </div>
      ),
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const fetchData = async () => {
    try {
      const response = await axios.get("/product");

      const featuredProduct = await axios.get("/featuredProduct");

      const realProducts = response.data.data.allProduct
        .filter(
          (product) =>
            !product.isFeaturedProducts && product.variants.length > 0
        )
        .map((variant, index) => ({
          ...variant,
          key: variant?._id,
          index: index + 1,
          name: variant?.name,
          category: variant?.category?.title || "N/A",
          subCategory: variant?.subCategory?.title || "N/A",
          photo: variant?.photo,
          isFeaturedProduct: featuredProduct.data.data.allFeaturedProduct.find(
            (featuredProduct) => featuredProduct.productRef?._id === variant._id
          )
            ? true
            : false,
        }));

      const reversedData = realProducts.reverse();
      setData(reversedData);
      setFilteredData(reversedData);

      const FeaturedProductsPackages = response.data.data.allProduct
        .filter((product) =>
          featuredProduct.data.data.allFeaturedProduct.find(
            (featuredProduct) => featuredProduct.productRef?._id === product._id
          )
        )
        .map((variant, index) => ({
          ...variant,
          key: variant?._id,
          index: index + 1,
          name: variant?.name,
          category: variant?.category?.title || "N/A",
          subCategory: variant?.subCategory?.title || "N/A",
          photo: variant?.photo,
        }));
      setFeaturedProducts(FeaturedProductsPackages);

      // setData(realProducts.reverse());
      // setFilteredData(realProducts.reverse());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/category");
      setCategories(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("/subCategory");
      setSubCategories(response.data.data.doc);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    if (trimmedSearchTerm === "") {
      setFilteredData(data); // Reset to original data if search term is empty
      return;
    }

    const filtered = data.filter((item) => {
      const titleMatch = item?.product?.name
        ?.toLowerCase()
        .includes(trimmedSearchTerm);
      const categoryMatch = item.category
        ?.toLowerCase()
        .includes(trimmedSearchTerm);
      const subCategoryMatch = item.subCategory
        ?.toLowerCase()
        .includes(trimmedSearchTerm);
      return titleMatch || categoryMatch || subCategoryMatch;
    });

    setFilteredData(filtered);
  };

  const renderImagesVideos = (photos) => {
    return photos?.map((url, index) => {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;

        return (
          <div key={index} style={{ marginBottom: "8px" }}>
            <iframe
              width="50"
              height="50"
              src={embedUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`YouTube Video ${index}`}
            ></iframe>
          </div>
        );
      } else {
        return (
          <img
            key={index}
            src={url}
            alt={`Image ${index + 1}`}
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              marginBottom: "8px",
              cursor: "pointer",
            }}
          />
        );
      }
    });
  };
  const sendApiRequest = async (id) => {
    try {
      const response = await axios.post("featuredProduct", {
        id,
      });

      toast.success(`${"response?.data?.message"}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      fetchData();
      // Handle the response as needed
      const data = await response.json(); // Parse the response data
    } catch (error) {
      console.error("Error updating featured status:", error);
    }
  };

  const columns = [
    {
      title: "#SL",
      dataIndex: "index",
      key: "index",
      fixed: "left",
      width: "7%",
      render: (index) => (index !== undefined ? index : "N/A"),
    },
    {
      width: "8%",
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => category || "N/A",
    },
    {
      width: "8%",
      title: "Sub Category",
      dataIndex: "subCategory",
      key: "subCategory",
      render: (subCategory) => subCategory || "N/A",
    },
    {
      width: "20%",
      title: "Title",
      dataIndex: "name",
      key: "title",
      render: (name) => name || "N/A",
    },
    {
      width: "10%",
      title: "Images/Video",
      dataIndex: ["photos"],
      key: "photos",
      render: (photos) =>
        photos && photos.length > 0 ? renderImagesVideos(photos) : "N/A",
    },
    {
      width: "10%",
      title: "Stocks",
      dataIndex: "variants",
      key: "optionSizes",
      render: (variants) =>
        variants && variants.length > 0 ? (
          <>
            {variants.map((variant, index) =>
              variant.options && variant.options.length > 0 ? (
                variant.options.map((option, optionIndex) => (
                  <div key={`${index}-${optionIndex}`}>
                    {option.stock || "N/A"}
                  </div>
                ))
              ) : (
                <div key={index}>N/A</div>
              )
            )}
          </>
        ) : (
          "N/A"
        ),
    },
    {
      width: "10%",
      title: "Color Name",
      dataIndex: "variants",
      key: "variantColorName",
      render: (variants) =>
        variants && variants.length > 0 ? (
          <>
            {variants.map((variant, index) => (
              <div key={index}>
                <span>{variant.colorName || "N/A"}</span>
              </div>
            ))}
          </>
        ) : (
          "N/A"
        ),
    },
    {
      width: "10%",
      title: "Available Sizes",
      dataIndex: "variants",
      key: "optionSizes",
      render: (variants) =>
        variants && variants.length > 0 ? (
          <>
            {variants.map((variant, index) =>
              variant.options && variant.options.length > 0 ? (
                variant.options.map((option, optionIndex) => (
                  <div key={`${index}-${optionIndex}`}>
                    {option.size || "N/A"}
                  </div>
                ))
              ) : (
                <div key={index}>N/A</div>
              )
            )}
          </>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Price",
      dataIndex: "variants",
      key: "price",
      render: (variants) =>
        variants && variants.length > 0 ? (
          <>
            {variants.map((variant, index) =>
              variant.options && variant.options.length > 0 ? (
                variant.options.map((option, optionIndex) => (
                  <div key={`${index}-${optionIndex}`}>
                    Price: {option.price ? `${option.price} TK` : "N/A"} | Size:
                    ({option.size || "N/A"})
                  </div>
                ))
              ) : (
                <div key={index}>N/A</div>
              )
            )}
          </>
        ) : (
          "N/A"
        ),
    },

    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: "10%",
      render: (item, record) => (
        <div>
          <Checkbox
            checked={selectedItems.has(item.key) || item.isFeaturedProduct} // Ensure it starts checked if featured
            onChange={(e) => {
              const checked = e.target.checked;

              setSelectedItems((prev) => {
                const newSet = new Set(prev);
                if (checked) {
                  newSet.add(item.key);
                } else {
                  newSet.delete(item.key);
                }
                return newSet;
              });

              // Send API request when checkbox is clicked
              sendApiRequest(item._id, checked);
            }}
          >
            {item.isFeaturedProduct ? "Featured" : "Not Featured"}
          </Checkbox>
        </div>
      ),
    },
  ];

  const selectedData = data.filter((item) => selectedItems.has(item.key));

  return (
    <div>
      <div
        className="flex justify-between items-center px-5"
        style={{ marginBottom: 16, marginTop: 10 }}
      >
        <div className="flex space-x-3">
          <Input
            placeholder="Search by Product Title, Category or SubCategory Name"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              handleSearch();
              if (value.trim() === "") {
                setFilteredData(data);
              }
            }}
            style={{ width: 400 }}
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <div>
          <div className="flex items-center mt-2 space-x-2">
            <Button
              className="hover:bg-white bg-blue-500 text-white font-semibold"
              onClick={showFeaturedProductsModal}
            >
              All FeaturedProductss
            </Button>
          </div>
        </div>
      </div>
      <Table columns={columns} dataSource={filteredData} scroll={{ x: 1300 }} />
      <Modal
        title="All FeaturedProductss"
        visible={FeaturedProductsModal}
        onCancel={handleFeaturedProductsCancel}
        footer={null}
        width={1200}
      >
        <Table
          dataSource={FeaturedProducts}
          columns={FeaturedProductsColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
      ;
    </div>
  );
};

export default AddFeaturedProducts;
