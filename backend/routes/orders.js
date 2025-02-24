const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Database connection
const { isAuthenticated } = require("../middleware/authMiddleware");

// 🟢 GET all orders for the logged-in user
// 🟢 GET all orders for the logged-in user
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user?.id;
      

        const [orders] = await db.execute(
            "SELECT id, items, total, payment_method, upi_amount, cash_amount, discount, delivery_fee, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        

        res.json(orders);
    } catch (error) {
        
        res.status(500).json({ error: "Internal Server Error" });
    }
});

  

// 🟢 POST a new order
router.post("/", isAuthenticated, async (req, res) => {
    try {
      

        const userId = req.user?.id;
        const { items, total, payment, discount, deliveryFee } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        if (!items || items.length === 0 || total === undefined || !payment?.method) {
            return res.status(400).json({ error: "All fields are required" });
        }

        

        // Insert order into the database
        const [result] = await db.execute(
            `INSERT INTO orders (user_id, items, total, payment_method, upi_amount, cash_amount, discount, delivery_fee) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                JSON.stringify(items), 
                total, 
                payment.method, 
                payment.upi || 0, 
                payment.cash || 0,
                discount || 0,  // ✅ Store discount
                deliveryFee || 0 // ✅ Store delivery fee
            ]
        );

        
        res.status(201).json({ message: "Order saved successfully", id: result.insertId });
    } catch (error) {
        
        res.status(500).json({ error: "Internal Server Error" });
    }
});

  

// 🟢 DELETE an order (only if it belongs to the user)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

   

    // Ensure the order belongs to the user before deleting
    const [existingOrder] = await db.execute(
      "SELECT id FROM orders WHERE id = ? AND user_id = ?",
      [orderId, userId]
    );

    if (existingOrder.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    await db.execute("DELETE FROM orders WHERE id = ?", [orderId]);

    
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
  
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
