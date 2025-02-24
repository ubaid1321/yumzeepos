import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../components/context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";

const AddItems = () => {
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const { user, loading } = useContext(UserContext);

  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ category: "", name: "", price: "" });

  useEffect(() => {
    if (user) {
      fetchMenuItems();
    }
  }, [user]);

  const fetchMenuItems = async () => {
    if (!user) return;

    try {
      const { data } = await axios.get(`${API_URL}/api/items`, { withCredentials: true });
      setMenuItems(data);
      toast.success("Menu items loaded successfully!"); // ✅ Success toast
    } catch (error) {
      toast.error("Failed to fetch menu items. Please try again."); // ❌ Error toast
    }
  };

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newItem.category || !newItem.name || !newItem.price) {
      toast.error("All fields are required!"); // ❌ Error toast
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/api/items`, newItem, { withCredentials: true });

      setMenuItems([...menuItems, { ...newItem, id: data.id }]);
      setNewItem({ category: "", name: "", price: "" });

      toast.success("Item added successfully!"); // ✅ Success toast
    } catch (error) {
      toast.error("Failed to add item. Please try again."); // ❌ Error toast
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/api/items/${itemId}`, { withCredentials: true });

      setMenuItems(menuItems.filter((item) => item.id !== itemId));
      toast.success("Item deleted successfully!"); // ✅ Success toast
    } catch (error) {
      toast.error("Failed to delete item. Please try again."); // ❌ Error toast
    }
  };
  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to manage your menu.</p>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row">
      {/* Add Item Form */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md mb-4 md:mb-0 md:mr-4">
        <h2 className="text-2xl font-semibold mb-4">Add Menu Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newItem.category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={newItem.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={newItem.price}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add Item
          </button>
        </form>
      </div>

      {/* Display Menu Items */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Menu Items</h2>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="border px-4 py-2">Category</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td className="border px-4 py-2">{item.category}</td>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.price}</td>
                <td className="border px-4 py-2">
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500 px-2 py-2 rounded-sm hover:text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddItems;
