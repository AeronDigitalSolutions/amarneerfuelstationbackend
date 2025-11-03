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

// ✅ Configure CORS (Render backend + Vercel frontend + local dev)
const allowedOrigins = [
  "https://amarneerfuelstationfrontend.vercel.app",
  "https://amarneerfuelstationfrontend-kvbd96vbl-aerons-projects-801a0715.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked CORS for origin:", origin);
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
// 🚀 Start Server (for Render + local dev)
// -------------------
const PORT = Number(process.env.PORT) || 5000;


// Render requires your app to *always* listen on process.env.PORT
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Export only if needed for testing
export default app;
