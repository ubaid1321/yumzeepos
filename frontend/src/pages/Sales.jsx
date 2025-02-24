import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../components/context/UserContext";

const Sales = () => {
  const API_URL=import.meta.env.VITE_BACKEND_URL
  const { user, loading } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [todaySales, setTodaySales] = useState(0);
  const [yesterdaySales, setYesterdaySales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [products, setProducts] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
      fetchProducts();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      
      const response = await axios.get(
        `${API_URL}/api/orders?user_id=${user.id}`,
        { withCredentials: true }
      );

      
      setOrders(response.data);
      calculateSales(response.data);
    } catch (error) {
      
    }
  };

  const fetchProducts = async () => {
    try {
      console.log("Fetching products...");
      const response = await axios.get(`${API_URL}/api/products`);
      const productMap = response.data.reduce((acc, product) => {
        acc[product.id] = product.name;
        return acc;
      }, {});

      
      setProducts(productMap);
    } catch (error) {
      
    }
  };

  const calculateSales = (orders) => {
    console.log("Calculating sales...");
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];
    const month = new Date().toISOString().slice(0, 7);

    let todayTotal = 0, yesterdayTotal = 0, monthTotal = 0;

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at).toISOString().split("T")[0];
      const orderAmount = Number(order.total);

      console.log(`Processing order ${order.id}: Date ${orderDate}, Amount ₹${orderAmount}`);

      if (orderDate === today) todayTotal += orderAmount;
      if (orderDate === yesterdayDate) yesterdayTotal += orderAmount;
      if (orderDate.startsWith(month)) monthTotal += orderAmount;
    });

    setTodaySales(todayTotal.toFixed(2));
    setYesterdaySales(yesterdayTotal.toFixed(2));
    setMonthSales(monthTotal.toFixed(2));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales Overview</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-700">Today's Sales</h2>
              <p className="text-2xl font-bold text-green-600 mt-2">₹{todaySales}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-700">Yesterday's Sales</h2>
              <p className="text-2xl font-bold text-yellow-600 mt-2">₹{yesterdaySales}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-700">Month's Sales</h2>
              <p className="text-2xl font-bold text-blue-600 mt-2">₹{monthSales}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-3">Order ID</th>
                    <th className="border p-3">Items</th>
                    <th className="border p-3">Total</th>
                    <th className="border p-3">Discount</th>
                    <th className="border p-3">Delivery Fee</th>
                    <th className="border p-3">Cash Paid</th>
                    <th className="border p-3">UPI Paid</th>
                    <th className="border p-3">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => {
                      const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items);
                      
                      // 🔹 Extract Cash & UPI amounts if available
                      const cashPaid = order.payment_method.includes("Cash") ? `₹${order.amount_entered || 0}` : "—";
                      const upiPaid = order.payment_method.includes("UPI") ? `₹${order.amount_entered || 0}` : "—";

                      return (
                        <tr key={order.id} className="text-center">
                          <td className="border p-3">{order.id}</td>
                          <td className="border p-3">
                            {items.map((item) => (
                              <span key={item.id}>
                                {products[item.id] || item.name || "Unknown Product"} ({item.quantity}){" "}
                              </span>
                            ))}
                          </td>
                          <td className="border p-3">₹{order.total}</td>
                          <td className="border p-3 text-red-500">-₹{order.discount}</td>
                          <td className="border p-3 text-green-500">+₹{order.delivery_fee}</td>
                          <td className="border p-3">{order.cash_amount}</td>
                          <td className="border p-3">{order.upi_amount}</td>
                          <td className="border p-3">{new Date(order.created_at).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center p-3">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sales;
