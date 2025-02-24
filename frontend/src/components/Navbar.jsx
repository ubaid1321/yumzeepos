import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaMoneyBillWave, FaPlus, FaShoppingCart } from "react-icons/fa";
import { UserContext } from "./context/UserContext"; // Import UserContext

const Navbar = () => {
  const API_URL=import.meta.env.VITE_BACKEND_URL
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, setUser } = useContext(UserContext); // Get user data from context
  const navigate = useNavigate(); // Use navigate for redirection

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null); // Clear user from context
      navigate("/"); // Redirect to login page after logout
    } catch (error) {
      
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div>
      {/* Navbar Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <button onClick={toggleSidebar} className="text-white text-2xl">
            <FaBars />
          </button>
          <h1
            className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Yumzee
          </h1>
        </div>

        {/* User Info & Buttons */}
        <div className="flex items-center space-x-4">
          <span className="text-lg">
            Welcome, <strong>{user ? user.name : "Guest"}</strong>
          </span>
          <Link to="/home">
            <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
              New Order
            </button>
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-6 z-50 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button onClick={toggleSidebar} className="text-white text-3xl mb-4">
          <FaTimes />
        </button>

        <ul className="space-y-6">
          <li className="flex items-center space-x-2">
            <FaShoppingCart className="text-xl" />
            <Link to="/sales" onClick={toggleSidebar} className="text-lg">
              Sales
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <FaMoneyBillWave className="text-xl" />
            <Link to="/expenses" onClick={toggleSidebar} className="text-lg">
              Expenses
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <FaPlus className="text-xl" />
            <Link to="/additem" onClick={toggleSidebar} className="text-lg">
              Add Item
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
