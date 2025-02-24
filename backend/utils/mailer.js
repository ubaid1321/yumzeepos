const nodemailer = require("nodemailer");
require("dotenv").config();

// Create transporter for Yumzee email
const transporter = nodemailer.createTransport({
  host: "mail.yumzee.co", // Your SMTP host
  port: 465, // SSL-enabled port
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER, // Your Yumzee email (info@yumzee.co)
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Function to send a welcome email
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"Yumzee Team" <${process.env.EMAIL_USER}>`, // Sender's name & email
    to: email, // User's email
    subject: "Welcome to Yumzee – Your Ultimate Business Companion! 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #ff6600;">Welcome to Yumzee, ${name}! 🎉</h2>
        <p>We're thrilled to have you on board! With Yumzee, you can **manage your daily expenses, track orders, boost sales, and upload your menu with just one click.**</p>

        <h3 style="color: #007bff;">Why You'll Love Yumzee:</h3>
        <ul>
          <li>✅ <strong>Effortless Order & Expense Management</strong> – Track everything in one place.</li>
          <li>✅ <strong>Easy Menu Upload</strong> – Update your menu with just one click.</li>
          <li>✅ <strong>Real-Time Sales Tracking</strong> – Know how your business is performing instantly.</li>
          <li>✅ <strong>User-Friendly & Secure</strong> – Built for convenience and reliability.</li>
        </ul>

        <p>At Yumzee, we’re committed to **making business management simple, fast, and efficient** so you can focus on **delivering the best experience to your customers.**</p>

        <p style="text-align: center;">
          <a href="http://localhost:5173/home" style="background-color: #ff6600; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">🚀 Get Started Now</a>
        </p>

        <p>If you have any questions, our support team is here for you anytime!</p>

        <p><strong>Happy Managing!</strong> 😊</p>
        <p><strong>Best regards,</strong><br>The Yumzee Team 🍽️</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = sendWelcomeEmail;
