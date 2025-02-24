require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("./config/passport");
const itemRoutes = require("./routes/items");
const authRoutes = require("./routes/authRoutes");
const ordersRoutes = require("./routes/orders");
const expensesRoutes = require("./routes/expenses");

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", ordersRoutes); 
app.use("/api/expenses", expensesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
