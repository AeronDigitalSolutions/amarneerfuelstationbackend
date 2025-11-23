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
import fuelRateRoutes from "./routes/fuelRateRoutes";
import pumpRoutes from "./routes/pumpRoutes";
import addtankRoutes from "./routes/addtankroutes";
import fuelTestRoutes from "./routes/fuelTestRoutes";
import shiftRoutes from "./routes/shiftRoutes";
import paymentRoutes from "./routes/payment";

import authRoutes from "./routes/authRoutes";



// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// -------------------
// 🧩 Middleware
// -------------------

// ✅ Allow Base64 / large payloads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

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
      if (!origin) return callback(null, true);

      if (
        origin.endsWith(".vercel.app") ||
        origin === "http://localhost:3000" ||
        origin === "http://localhost:5173"
      ) {
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
app.use("/api/auth", authRoutes);
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
app.use("/api/fuel-rates", fuelRateRoutes);
app.use("/api/pumps", pumpRoutes);
app.use("/api/tank-master", addtankRoutes);
app.use("/api/fueltest", fuelTestRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/payments", paymentRoutes);



// -------------------
// 🏁 Root Route
// -------------------
app.get("/", (_req, res) => {
  res.json({ message: "🚀 Amar Neer Fuel Station Backend is running!" });
});

console.log("🔥 SERVER RUNNING FROM:", __dirname);


// -------------------
// 🚀 Start Server (Render + local dev)
// -------------------
const PORT = Number(process.env.PORT) || 5000;

// Render requires your app to *always* listen on process.env.PORT
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Export only if needed for testing
export default app;
