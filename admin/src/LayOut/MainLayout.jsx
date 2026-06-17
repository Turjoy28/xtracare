import { useEffect, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { GiCardboardBox, GiKnightBanner } from "react-icons/gi";
import { Button, Layout, Menu, theme } from "antd";
import { Link, useNavigate } from "react-router-dom";
import Home from "../Pages/DashBoardHome";
import Order from "../Pages/Order";
import UploadBanner from "../Pages/UploadBanner";
import AddCategory from "../Pages/Category";
import AllBanner from "../Pages/AllBanner";
import UploadProduct from "../Pages/UploadProduct";
import AllProduct from "../Pages/AllProduct";
import logo from "../assets/logos/main-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { activeUser } from "../Slices/userSlices";
import AddDiscount from "../Pages/AddDiscount";
import AddReview from "../Pages/AddReview";
import ApplayCuppon from "../Pages/ApplayCuppon";
import AddBrand from "../Pages/AddBrand";
import AddBundle from "../Pages/AddBundle";
import AddFeaturedProducts from "../Pages/AddFeaturedProducts";
import UploadlandingBanner from "../Pages/UploadLandingBanner";
import UploadlandingCustomerReview from "../Pages/UploadLandingCustomerReview";
import AddLifeStyleHotTitle from "../Pages/AddLifeStyleHotTitle";
import AddLifeStyleCustomerReview from "../Pages/AddLifeStyleCustomerReview";
import AddLifeStyleProduct from "../Pages/AddLifeStyleProduct";
import AddLifeStyleOrder from "../Pages/AddLifeStyleOrder";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");
  const selectore = useSelector((state) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (selectore?.users?.userValue?.data?.user?.role !== "aklogicAdmin") {
      navigate("/");
    }
  }, []);
  const handleMenuItemClick = (key) => {
    setSelectedMenuItem(key);
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }
  let content = null;
  switch (selectedMenuItem) {
    case "1":
      content = <Home />;
      break;
    case "2":
      content = <Order />;
      break;
    case "3":
      content = <UploadBanner />;
      break;
    case "4":
      content = <AllBanner />;
      break;

    case "5":
      content = <AddCategory />;
      break;
    case "7":
      content = <UploadProduct />;
      break;
    case "8":
      content = <AllProduct />;
      break;
    case "9":
      content = <AddDiscount />;
      break;
    case "10":
      content = <AddReview />;
      break;
    case "11":
      content = <ApplayCuppon />;
      break;
    case "12":
      content = <AddBrand />;
      break;
    case "13":
      content = <AddBundle />;
      break;

    case "14":
      content = <UploadlandingBanner />;
      break;
    case "15":
      content = <UploadlandingCustomerReview />;
      break;
    case "16":
      content = <AddFeaturedProducts />;
      break;
    case "17":
      content = <AddLifeStyleHotTitle />;
      break;
    case "18":
      content = <AddLifeStyleCustomerReview />;
      break;
    case "19":
      content = <AddLifeStyleProduct />;
      break;
    case "20":
      content = <AddLifeStyleOrder />;
      break;

    default:
      content = (
        <div className="text-center text-xl font-bold py-10">
          okobiz Default Content
        </div>
      );
  }

  let items = [
    getItem("Dashboard ", "1", <UserOutlined />),

    getItem("Order", "2", <FileOutlined />),
    getItem("ADD Category", "5", <FileOutlined />),

    getItem("Product", "sub4", <UploadOutlined />, [
      getItem("Upload Product", "7"),
      getItem("All Product", "8"),
      getItem("Brand", "12"),
    ]),
    getItem("Upload Banner", "3", <GiKnightBanner />),
    getItem("Add Discount", "9", <FileOutlined />),
    getItem("Coupon", "11", <FileOutlined />),
    getItem("Add Bundle", "13", <GiCardboardBox />),
    getItem("Landing Page", "sub5", <UploadOutlined />, [
      getItem("Banner", "14"),
      getItem("Customer Review", "15"),
      getItem("Featured Products", "16"),
      getItem("Hot Title", "17"),
      getItem("Customer Review Title", "18"),
      getItem("Product Title", "19"),
      getItem("Order Title", "20"),
    ]),
    // getItem("Add Review", "10", <FileOutlined />),
  ];

  let handelLogout = () => {
    localStorage.removeItem("user");
    dispatch(activeUser(null));
    navigate("/");
  };

  return (
    <Layout hasSider>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
        className="drop-shadow"
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className="text-white  mx-auto  font-bold text-2xl leading-[80px] text-center  my-5 flex justify-center ">
          <img src={logo} className="w-32"></img>
        </div>
        <Menu
          theme="light"
          className="text-white !font-bold"
          onClick={({ key }) => handleMenuItemClick(key)}
          defaultSelectedKeys={["sub1"]}
          mode="inline"
          selectedKeys={[selectedMenuItem]}
          items={items}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 70 : 200, // Adjust marginLeft dynamically
        }}
      >
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <div className="flex items-center ">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </div>
        </Header>
        <Content
          className="bg-[#F6F8FA] px-5 "
          style={{
            overflow: "initial",
          }}
        >
          {content}
          <h1 className="my-5 " style={{ textAlign: "center" }}>
            Developed by{" "}
            <Link className="font-bold text-black" to={"https://okobiz.com"}>
              okobiz
            </Link>
          </h1>
        </Content>

        <div
          onClick={handelLogout}
          className="text-center bg-red-500 p-2 rounded  text-white  gap-x-1 absolute right-5 top-5   cursor-pointer font-bold uppercase "
        >
          <p>Log Out</p>
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
