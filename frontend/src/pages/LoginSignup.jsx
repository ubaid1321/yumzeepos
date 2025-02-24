import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const API_URL=import.meta.env.VITE_BACKEND_URL
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/auth/profile`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        
        if (data.user) {
          setUser(data.user);
          setIsNewUser(false); 
          navigate("/home"); 
        } else {
          setIsNewUser(true);
        }
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, [navigate]);

  const handleGoogleAuth = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleLogout = () => {
    fetch(`${API_URL}/api/auth/logout`, { credentials: "include" })
      .then(() => setUser(null))
      .catch((err) => console.error("Logout failed:", err));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        {user ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
            <img src={user.photo} alt="User Profile" className="rounded-full w-24 h-24 mx-auto mb-4" />
            <p className="text-lg">{user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">
              {isNewUser ? "Sign up with Google" : "Sign in with Google"}
            </h2>
            <button
              onClick={handleGoogleAuth}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              {isNewUser ? "Sign up with Google" : "Sign in with Google"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
