const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Database connection
const { isAuthenticated } = require("../middleware/authMiddleware");

// GET all items for the logged-in user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

   

    const [items] = await db.execute(
      `SELECT items.id, items.name, items.price, categories.name AS category 
       FROM items 
       JOIN categories ON items.category_id = categories.id 
       WHERE items.user_id = ?`, 
      [userId]
    );

    
    res.json(items);
  } catch (error) {
   
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST a new item (ensuring category is unique for the user)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { category, name, price } = req.body;
    const userId = req.user.id;

    if (!category || !name || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    

    // Check if category already exists for this user
    let [existingCategory] = await db.execute(
      "SELECT id FROM categories WHERE user_id = ? AND name = ?",
      [userId, category]
    );

    let categoryId;
    if (existingCategory.length > 0) {
      categoryId = existingCategory[0].id; // Use existing category
      
    } else {
      // Create new category
      const [categoryResult] = await db.execute(
        "INSERT INTO categories (user_id, name) VALUES (?, ?)",
        [userId, category]
      );
      categoryId = categoryResult.insertId;
      
    }

    // Insert new item
    const [itemResult] = await db.execute(
      "INSERT INTO items (user_id, category_id, name, price) VALUES (?, ?, ?, ?)",
      [userId, categoryId, name, price]
    );

    

    res.status(201).json({ message: "Item added successfully", id: itemResult.insertId });
  } catch (error) {
  
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE an item (only if it belongs to the user)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    

    // Ensure the item belongs to the user before deleting
    const [existingItem] = await db.execute(
      "SELECT id FROM items WHERE id = ? AND user_id = ?",
      [itemId, userId]
    );

    if (existingItem.length === 0) {
      
      return res.status(404).json({ error: "Item not found" });
    }

    await db.execute("DELETE FROM items WHERE id = ?", [itemId]);

    
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
 
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
