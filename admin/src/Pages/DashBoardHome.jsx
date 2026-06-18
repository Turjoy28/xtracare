import React, { useState, useEffect, useMemo } from "react";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { TbBasketCancel, TbTruckDelivery, TbTruckReturn } from "react-icons/tb";
import { MdOutlineSell, MdPendingActions, MdCheckCircleOutline, MdLocalShipping } from "react-icons/md";
import { Select } from "antd";
import axios from "../Components/Axios";
import dayjs from "dayjs";
import CountUp from "react-countup";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const { Option } = Select;

const Home = () => {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1; // dayjs month is 0-indexed

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(null);

  const [allOrders, setAllOrders] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, productRes] = await Promise.all([
          axios.get("/order"),
          axios.get("/varient")
        ]);
        setAllOrders(orderRes.data?.data?.doc || []);
        setTotalProducts((productRes.data?.data?.doc || []).length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  // Filter and compute stats whenever filters or data change
  const {
    filteredOrders, stats, chartData
  } = useMemo(() => {
    let filtered = allOrders.filter(order => {
      const orderDate = dayjs(order.createdAt);
      if (selectedYear && orderDate.year() !== selectedYear) return false;
      if (selectedMonth && orderDate.month() + 1 !== selectedMonth) return false;
      if (selectedDay && orderDate.date() !== selectedDay) return false;
      return true;
    });

    const newStats = {
      pending: 0,
      approved: 0,
      shipped: 0,
      delivered: 0,
      canceled: 0,
      deliveredSales: 0,
    };

    const groupedData = {};

    filtered.forEach(order => {
      const status = order.orderStatus || "pending";
      if (newStats[status] !== undefined) {
        newStats[status]++;
      }
      
      if (status === "delivered") {
        newStats.deliveredSales += (order.totalCost || 0);
      }

      // Group for chart
      const dateStr = dayjs(order.createdAt).format("MMM DD");
      if (!groupedData[dateStr]) {
        groupedData[dateStr] = { date: dateStr, sales: 0, orders: 0 };
      }
      if (status === "delivered") {
        groupedData[dateStr].sales += (order.totalCost || 0);
      }
      groupedData[dateStr].orders += 1;
    });

    const newChartData = Object.values(groupedData).sort((a, b) => 
      dayjs(a.date, "MMM DD").isBefore(dayjs(b.date, "MMM DD")) ? -1 : 1
    );

    return { filteredOrders: filtered, stats: newStats, chartData: newChartData };
  }, [allOrders, selectedYear, selectedMonth, selectedDay]);

  // Options for Dropdowns
  const years = Array.from({length: 10}, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
  ];
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };
  const days = selectedYear && selectedMonth ? Array.from({length: getDaysInMonth(selectedYear, selectedMonth)}, (_, i) => i + 1) : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        
        {/* Filters */}
        <div className="flex gap-4 flex-wrap bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Year:</span>
            <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 100 }} allowClear>
              {years.map(y => <Option key={y} value={y}>{y}</Option>)}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Month:</span>
            <Select value={selectedMonth} onChange={(v) => { setSelectedMonth(v); setSelectedDay(null); }} style={{ width: 120 }} allowClear>
              {months.map(m => <Option key={m.value} value={m.value}>{m.label}</Option>)}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Day:</span>
            <Select value={selectedDay} onChange={setSelectedDay} style={{ width: 80 }} disabled={!selectedMonth} allowClear placeholder="All">
              {days.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Products */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="bg-purple-100 p-4 rounded-full flex-shrink-0">
            <TbBasketCancel size="30" className="text-purple-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Products</p>
            <h3 className="font-bold text-2xl text-gray-800">
              <CountUp end={totalProducts} duration={2} separator="," />
            </h3>
          </div>
        </div>

        {/* Delivered Sales */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="bg-emerald-100 p-4 rounded-full flex-shrink-0">
            <MdOutlineSell size="30" className="text-emerald-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Sales (Delivered)</p>
            <h3 className="font-bold text-2xl text-gray-800">
              ৳ <CountUp end={stats.deliveredSales} duration={2} separator="," />
            </h3>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="bg-amber-100 p-4 rounded-full flex-shrink-0">
            <MdPendingActions size="30" className="text-amber-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Pending Orders</p>
            <h3 className="font-bold text-2xl text-gray-800">
              <CountUp end={stats.pending} duration={2} separator="," />
            </h3>
          </div>
        </div>

        {/* Approved Orders */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="bg-blue-100 p-4 rounded-full flex-shrink-0">
            <MdCheckCircleOutline size="30" className="text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Approved Orders</p>
            <h3 className="font-bold text-2xl text-gray-800">
              <CountUp end={stats.approved} duration={2} separator="," />
            </h3>
          </div>
        </div>

        {/* Shipped Orders */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="bg-indigo-100 p-4 rounded-full flex-shrink-0">
            <MdLocalShipping size="30" className="text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Shipped Orders</p>
            <h3 className="font-bold text-2xl text-gray-800">
              <CountUp end={stats.shipped} duration={2} separator="," />
            </h3>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="bg-teal-100 p-4 rounded-full flex-shrink-0">
            <TbTruckDelivery size="30" className="text-teal-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Delivered Orders</p>
            <h3 className="font-bold text-2xl text-gray-800">
              <CountUp end={stats.delivered} duration={2} separator="," />
            </h3>
          </div>
        </div>

        {/* Canceled Orders */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="bg-red-100 p-4 rounded-full flex-shrink-0">
            <TbTruckReturn size="30" className="text-red-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Canceled Orders</p>
            <h3 className="font-bold text-2xl text-gray-800">
              <CountUp end={stats.canceled} duration={2} separator="," />
            </h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
          <div className="bg-gray-200 p-4 rounded-full flex-shrink-0">
            <LiaFileInvoiceSolid size="30" className="text-gray-700" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Orders</p>
            <h3 className="font-bold text-2xl text-gray-800">
              <CountUp end={filteredOrders.length} duration={2} separator="," />
            </h3>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Sales Trend (Delivered)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#888'}} />
                <YAxis tick={{fontSize: 12, fill: '#888'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{ r: 6 }} name="Sales (৳)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Volume (All Statuses)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#888'}} />
                <YAxis tick={{fontSize: 12, fill: '#888'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Number of Orders" maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
