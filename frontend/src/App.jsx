import React, { useContext, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginSignup from "./pages/LoginSignup";
import Home from "./pages/Home";
import { UserContext } from "./components/context/UserContext";
import AddItems from "./pages/AddItems";
import Menu from "./pages/Menu";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";


const App = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>; // Prevent rendering before user data is fetched
  }

  return (
    <div>
      <Navbar />
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        <Route path="/" element={!user ? <LoginSignup /> : <Navigate to="/home" />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="/additem" element={user ? <AddItems /> : <Navigate to="/" />} />
        <Route path="/menu/:tableNo" element={user ? <Menu /> : <Navigate to="/" />} />
        <Route path="/sales" element={user ? <Sales /> : <Navigate to="/" />} />
        <Route path="/expenses" element={user ? <Expenses /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
