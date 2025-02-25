const db = require("../config/db");

// Get user by Google ID
const getUserByGoogleId = async (googleId) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE google_id = ?", [googleId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(" Error fetching user:", error);
    return null;
  }
};

// Create new user
const createUser = async (googleId, name, email, photo) => {
  try {
    await db.execute(
      "INSERT INTO users (google_id, name, email, photo, created_at) VALUES (?, ?, ?, ?, NOW())",
      [googleId, name, email, photo]
    );
    
  } catch (error) {
    
  }
};

module.exports = { getUserByGoogleId, createUser };
