import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

// Import routes
import saleRoutes from "./routes/saleRoutes";
import tankRoutes from "./routes/tankRoutes";
import financeRoutes from "./routes/financeRoutes";
import creditRoutes from "./routes/creditLineRoutes";
import adminRoutes from "./routes/adminRoutes";
import payrollRoutes from "./routes/payrollRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// -------------------
// 🧩 Middleware
// -------------------
app.use(express.json());

// ✅ Configure CORS (allow Vercel frontend + local dev)
const allowedOrigins = [
  "https://amarneerfuelstationfrontend.vercel.app", // your deployed frontend
  "http://localhost:3000" // local dev frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// -------------------
// 🛣️ API Routes
// -------------------
app.use("/api/sales", saleRoutes);
app.use("/api/tanks", tankRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api", creditRoutes);
app.use("/api", adminRoutes);
app.use("/api", dashboardRoutes);

// -------------------
// 🏁 Root Route
// -------------------
app.get("/", (req, res) => {
  res.json({ message: "🚀 Amar Neer Fuel Station Backend is running!" });
});

// -------------------
// 🚀 Run locally
// -------------------
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

// -------------------
// ✅ Export for Vercel serverless
// -------------------
export default app;
