import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

const Home = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, i) => ({ tableNo: i + 1, total: 0, hasOrder: false }))
  );

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn"); 
    if (isLoggedIn === "true") {
      toast.success("Logged in successfully!", { autoClose: 2000, position: "top-right" });
      localStorage.removeItem("isLoggedIn"); // ✅ Clear after showing toast
    }

    setTables((prevTables) =>
      prevTables.map((table) => {
        const savedOrder = localStorage.getItem(`order_table_${table.tableNo}`);
        const orderData = savedOrder ? JSON.parse(savedOrder) : { totalAmount: 0, items: [] };

        const hasOrder = orderData.items && orderData.items.length > 0;

        return { 
          ...table, 
          total: hasOrder ? parseFloat(orderData.totalAmount) : 0, 
          hasOrder: hasOrder
        };
      })
    );
  }, []);

  const handleTableClick = (tableNo) => {
    navigate(`/menu/${tableNo}`);
  };

  return (
    <div className="bg-gray-100 h-screen p-6 relative">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Tables</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {tables.map((table) => (
          <div
            key={table.tableNo}
            onClick={() => handleTableClick(table.tableNo)}
            className={`p-6 rounded-lg shadow-md text-center cursor-pointer 
              ${table.hasOrder ? "bg-green-500 text-white" : "bg-white hover:bg-gray-200"}`}
          >
            <h2 className="text-xl font-semibold">Table {table.tableNo}</h2>
            {table.hasOrder && <p className="mt-2">Total: ₹{table.total}</p>}
          </div>
        ))}
      </div>

      
      <ToastContainer />

     
      <motion.div 
        className="fixed bottom-6 right-6 bg-white p-3 rounded-lg shadow-md border border-gray-300"
        animate={{ y: [0, -10, 0] }} 
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
      >
        <p className="text-gray-700 text-sm">Need help or have queries?</p>
        <a 
          href="mailto:info@yumzee.co" 
          className="text-blue-600 text-sm font-semibold hover:underline"
        >
          Contact us at info@yumzee.co
        </a>
      </motion.div>
    </div>
  );
};

export default Home;
