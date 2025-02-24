import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../components/context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure toast styles are included

const Expenses = () => {
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const { user, loading } = useContext(UserContext);
  const [expenses, setExpenses] = useState([]);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [monthExpenses, setMonthExpenses] = useState(0);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/expenses`, {
        withCredentials: true,
      });
      setExpenses(response.data);
      calculateExpenseTotals(response.data);
    } catch (error) {
      toast.error("Failed to fetch expenses. Please try again.");
    }
  };

  const calculateExpenseTotals = (expenses) => {
    const today = new Date().toISOString().split("T")[0];
    const month = new Date().toISOString().slice(0, 7);

    let todayTotal = 0,
      monthTotal = 0;

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.created_at)
        .toISOString()
        .split("T")[0];

      if (expenseDate === today) todayTotal += Number(expense.amount);
      if (expenseDate.startsWith(month)) monthTotal += Number(expense.amount);
    });

    setTodayExpenses(todayTotal.toFixed(2));
    setMonthExpenses(monthTotal.toFixed(2));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!name || !amount) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/expenses`,
        { name, amount },
        { withCredentials: true }
      );

      setExpenses((prevExpenses) => [
        ...prevExpenses,
        {
          id: response.data.id,
          name,
          amount,
          created_at: new Date().toISOString(),
        },
      ]);

      setName("");
      setAmount("");
      calculateExpenseTotals([...expenses, response.data]);

      toast.success("Expense added successfully!");
    } catch (error) {
      toast.error("Failed to add expense. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/expenses/${id}`, {
        withCredentials: true,
      });

      const updatedExpenses = expenses.filter((expense) => expense.id !== id);
      setExpenses(updatedExpenses);
      calculateExpenseTotals(updatedExpenses);

      toast.success("Expense deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete expense. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Expense Tracker</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Today's Expenses
              </h2>
              <p className="text-2xl font-bold text-red-600 mt-2">
                ₹{todayExpenses}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Month's Expenses
              </h2>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ₹{monthExpenses}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Add Expense
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <input
                type="text"
                placeholder="Expense Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded"
              >
                Add Expense
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Your Expenses
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-3">Expense Name</th>
                    <th className="border p-3">Amount</th>
                    <th className="border p-3">Date</th>
                    <th className="border p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="text-center">
                        <td className="border p-3">{expense.name}</td>
                        <td className="border p-3">₹{expense.amount}</td>
                        <td className="border p-3">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </td>
                        <td className="border p-3">
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="bg-red-500 text-white p-2 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center p-3">
                        No expenses found
                      </td>
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

export default Expenses;
