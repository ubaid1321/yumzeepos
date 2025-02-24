import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../components/context/UserContext";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

const Menu = () => {
  const API_URL=import.meta.env.VITE_BACKEND_URL
  const { user } = useContext(UserContext);
  const { tableNo } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState({});
  const [order, setOrder] = useState([]);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState({ upi: "", cash: "" });

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/items`, {
          withCredentials: true,
        });

        const grouped = response.data.reduce((acc, item) => {
          acc[item.category] = acc[item.category] || [];
          acc[item.category].push(item);
          return acc;
        }, {});

        setCategories(grouped);
      } catch (error) {
        
      }
    };

    fetchMenu();

    const savedOrder = localStorage.getItem(`order_table_${tableNo}`);
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder);
      setOrder(parsedOrder.items);
      setTotal(parsedOrder.totalAmount);
      setDiscount(parsedOrder.discount || 0);
      setDeliveryFee(parsedOrder.deliveryFee || 0);
    }
  }, [tableNo]);

  const addItemToOrder = (item) => {
    const existingItem = order.find((o) => o.id === item.id);
    let newOrder;

    if (existingItem) {
      newOrder = order.map((o) =>
        o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
      );
    } else {
      newOrder = [...order, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    }

    setOrder(newOrder);
    updateTotalWithFees(newOrder, discount, deliveryFee);
    saveOrder(newOrder);
  };

  const updateOrderQuantity = (id, change) => {
    const newOrder = order
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + change } : item
      )
      .filter((item) => item.quantity > 0);

    setOrder(newOrder);

    if (newOrder.length === 0) {
      setTotal(0);
      setDiscount(0);
      setDeliveryFee(0);
      saveOrder(newOrder, 0, 0, 0);
    } else {
      const updatedTotal = newOrder.reduce((sum, item) => sum + item.price * item.quantity, 0) - discount + deliveryFee;
      setTotal(updatedTotal);
      saveOrder(newOrder, updatedTotal, discount, deliveryFee);
    }
  };

  const updateTotalWithFees = (orderList, discountValue, deliveryValue) => {
    const subtotal = orderList.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalPrice = subtotal - discountValue + deliveryValue;
    setTotal(totalPrice);
  };

  const saveOrder = (order, updatedTotal, updatedDiscount = discount, updatedDeliveryFee = deliveryFee) => {
    const orderData = {
      items: order,
      totalAmount: updatedTotal,
      discount: updatedDiscount,
      deliveryFee: updatedDeliveryFee,
    };
    localStorage.setItem(`order_table_${tableNo}`, JSON.stringify(orderData));
  };

  const handleSaveAndExit = () => {
    saveOrder(order, total, discount, deliveryFee);
    navigate("/home");
  };

  const handleDiscountChange = (value) => {
    setDiscount(value === "" ? "" : parseFloat(value)); // 🔹 Keep it empty when user deletes input
    updateTotalWithFees(order, value === "" ? 0 : parseFloat(value), deliveryFee);
  };
  
  const handleDeliveryFeeChange = (value) => {
    setDeliveryFee(value === "" ? "" : parseFloat(value)); // 🔹 Keep it empty when user deletes input
    updateTotalWithFees(order, discount, value === "" ? 0 : parseFloat(value));
  };

  const handlePaymentInput = (method, value) => {
    setAmountPaid({ ...amountPaid, [method]: value });
  };

  const settleOrder = async () => {
    if (!user) {
      toast.error("User Must be Logged in First")
      return;
    }

    if (order.length === 0) {
      toast.error("No items in the order")
      return;
    }

    if (paymentMethod === "both" && (!amountPaid.upi || !amountPaid.cash)) {
      toast.error("Please enter Cash amd Upi amount")
      return;
    } else if (paymentMethod !== "both" && !amountPaid[paymentMethod]) {
      toast.error(` Please enter ${paymentMethod.toUpperCase()} amount.`);
      return;
    }

    const settleAmount = parseFloat(amountPaid.upi || 0) + parseFloat(amountPaid.cash || 0);

    const orderData = {
      userId: user.id,
      tableNo: tableNo,
      items: order.map(({ id, name, quantity }) => ({ id, name, quantity })),
      total,
      discount,
      deliveryFee,
      settleAmount, 
      payment: {
        method: paymentMethod,
        upi: amountPaid.upi || 0,
        cash: amountPaid.cash || 0,
      },
    };
    
    try {
      await axios.post(`${API_URL}/api/orders`, orderData, {
        withCredentials: true,
      });
      toast.success(" Order settled successfully!");
      localStorage.removeItem(`order_table_${tableNo}`);
      setOrder([]);
      setTotal(0);
      setDiscount(0);
      setDeliveryFee(0);
      setAmountPaid({ upi: "", cash: "" });
      setPaymentMethod("");
      navigate("/home");
    } catch (error) {
      
      toast.error("Erros Settling Order")
    }
  };
  const handlePrintReceipt = () => {
    const printWindow = window.open("", "_blank");
    const receiptContent = document.getElementById("receipt").innerHTML;
  
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                margin: 0;
                padding: 10px;
                width: 80mm; /* Ensures it prints in receipt format */
              }
              .hidden {
                display: none;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${receiptContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Table {tableNo} - Menu</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* Menu List */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold">Available Items</h2>
          {Object.keys(categories).map((category) => (
           <div key={category} className="mb-6">
           <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">{category}</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {categories[category].map((item) => (
               <div
                 key={item.id}
                 className="bg-gray-200 p-4 rounded-xl shadow-xl  flex flex-col items-center justify-between text-center transition-transform transform hover:scale-105"
               >
                 {/* Item Name */}
                 <h4 className="text-sm font-medium mb-2 text-gray-800">{item.name}</h4>
         
                 {/* Price */}
                 <span className="text-base font-semibold text-gray-700 mb-3">{item.price}</span>
         
                 {/* Add Button */}
                 <button
                   onClick={() => addItemToOrder(item)}
                   className="bg-green-500 text-white text-sm px-4 py-1 rounded-md hover:bg-green-600 transition"
                 >
                   Add
                 </button>
               </div>
             ))}
           </div>
         </div>
         
          ))}
        </div>

        {/* Order Panel */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold">Order Panel</h2>
          <ul>
            {order.map((item) => (
              <li key={item.id} className="flex justify-between p-2 border-b">
                {item.name} - ₹{item.price * item.quantity}
                <div>
                  <button
                    onClick={() => updateOrderQuantity(item.id, -1)}
                    className="bg-gray-300 text-black px-2 mx-1"
                  >
                    -
                  </button>
                  {item.quantity}
                  <button
                    onClick={() => updateOrderQuantity(item.id, 1)}
                    className="bg-gray-300 text-black px-2 mx-1"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

        

          {/* Total Amount */}
          <h3 className="text-lg font-bold mt-4">Total: ₹{total}</h3>

          {/* Save Order Button */}
          <button
            onClick={handleSaveAndExit}
            className="bg-yellow-500 text-white px-4 py-2 mt-4 w-full"
          >
            Save Order
          </button>
          <h2 className="text-xl font-semibold mt-4">Additional Charges</h2>
 
{/* Discount Input */}
<label className="block font-medium mt-2">Discount</label>
<input
  type="number"
  placeholder="0"
  className="border p-2 w-full"
  value={discount === "" ? "" : discount}
  onChange={(e) => handleDiscountChange((e.target.value))}
  onWheel={(e) => e.target.blur()} 
/>

{/* Delivery Fee Input */}
<label className="block font-medium mt-2">Delivery Fee</label>
<input
  type="number"
  placeholder="0"
  className="border p-2 w-full"
  value={deliveryFee === "" ? "" : deliveryFee}
  onChange={(e) => handleDeliveryFeeChange( e.target.value)}
  onWheel={(e) => e.target.blur()} 
/>

{/* ✅ Total Updates When Discount/Delivery Fee Changes */}
<h3 className="text-lg font-bold mt-4">Total: ₹{total}</h3>

{/* Payment Section */}
<h2 className="text-xl font-semibold mt-4">Payment</h2>
<select
  className="border p-2"
  onChange={(e) => setPaymentMethod(e.target.value)}
>
  <option value="">Select Payment Method</option>
  <option value="upi">UPI</option>
  <option value="cash">Cash</option>
  <option value="both">Both</option>
</select>

{paymentMethod && (
  <div className="mt-2">
    {paymentMethod === "both" ? (
      <>
        <label className="block font-medium mt-2">UPI Amount</label>
        <input
          type="number"
          placeholder="0"
          onChange={(e) => handlePaymentInput("upi", e.target.value)}
          onWheel={(e) => e.target.blur()} 
          className="border p-2 w-full"
        />

        <label className="block font-medium mt-2">Cash Amount</label>
        <input
          type="number"
          placeholder="0"
          onChange={(e) => handlePaymentInput("cash", e.target.value)}
          onWheel={(e) => e.target.blur()} 
          className="border p-2 w-full"
        />
      </>
    ) : (
      <>
        <label className="block font-medium mt-2">
          {paymentMethod.toUpperCase()} Amount
        </label>
        <input
          type="number"
          placeholder="0"
          onChange={(e) => handlePaymentInput(paymentMethod, e.target.value)}
          onWheel={(e) => e.target.blur()} 
          className="border p-2 w-full"
        />
      </>
    )}
  </div>
)}

          {/* Settle Order Button */}
          <button
            onClick={settleOrder}
            className="bg-green-500 text-white px-4 py-2 mt-4 w-full"
          >
            ✅ Settle Order
          </button>
          <button
  onClick={handlePrintReceipt}
  className="bg-blue-500 text-white px-4 py-2 mt-2 w-full"
>
   Print Receipt
</button>
          {/* Hidden Receipt Section */}
<div id="receipt" className="hidden print:block p-4 border">
  <h2 className="text-xl font-bold text-center">🧾 Receipt</h2>
  <p>Table: {tableNo}</p>
  <p>Cashier: {user?.name}</p>
  <hr className="my-2" />
  <ul>
    {order.map((item) => (
      <li key={item.id}>
        {item.name} x {item.quantity} - ₹{item.price * item.quantity}
      </li>
    ))}
  </ul>
  <hr className="my-2" />
  <p><strong>Subtotal:</strong> ₹{total + discount - deliveryFee}</p>
  <p><strong>Discount:</strong> ₹{discount}</p>
  <p><strong>Delivery Fee:</strong> ₹{deliveryFee}</p>
  <p><strong>Total:</strong> ₹{total}</p>
  <p><strong>Paid:</strong> ₹{amountPaid.upi || 0} (UPI) + ₹{amountPaid.cash || 0} (Cash)</p>
  <hr className="my-2" />
  <p className="text-center">Thank you! Visit Again 🙏</p>
</div>



        </div>
      </div>
    </div>
  );
};

export default Menu;