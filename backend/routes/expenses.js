const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Database connection
const {isAuthenticated}=require("../middleware/authMiddleware")

// ✅ Fetch all expenses for a user
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        

        // Fetch expenses from DB
        const [expenses] = await db.execute(
            "SELECT id, name, amount, created_at FROM expenses WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

       

        // ✅ Ensure the response is always an array
        res.json(Array.isArray(expenses) ? expenses : []);
    } catch (error) {
        
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ✅ Add a new expense
router.post("/", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, amount } = req.body;

        if (!name || !amount) {
            return res.status(400).json({ error: "Name and amount are required" });
        }

        

        // Insert into database
        const [result] = await db.execute(
            "INSERT INTO expenses (user_id, name, amount) VALUES (?, ?, ?)",
            [userId, name, amount]
        );

        // ✅ Return newly created expense in correct format
        res.status(201).json({ id: result.insertId, name, amount, created_at: new Date().toISOString() });
    } catch (error) {
        
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ✅ Delete an expense
router.delete("/:id", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const expenseId = req.params.id;

       

        // ✅ Check if the expense exists and belongs to the user
        const [expense] = await db.query(
            "SELECT id FROM expenses WHERE id = ? AND user_id = ?",
            [expenseId, userId]
        );

        if (expense.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }

        // ✅ Delete the expense
        await db.query("DELETE FROM expenses WHERE id = ?", [expenseId]);

        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
       
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
