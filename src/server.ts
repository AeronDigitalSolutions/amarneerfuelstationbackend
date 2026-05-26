import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

// Import routes
import saleRoutes from "./routes/saleRoutes";
import tankRoutes from "./routes/tankRoutes";
import financeRoutes from "./routes/financeRoutes";
import creditRoutes from "./routes/creditLineRoutes";
import adminRoutes from "./routes/adminRoutes";
import payrollRoutes from "./routes/payrollRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import fuelRateRoutes from "./routes/fuelRateRoutes";
import machineRoutes from "./routes/machineRoutes";
import addtankRoutes from "./routes/addtankroutes";
import fuelTestRoutes from "./routes/fuelTestRoutes";
import shiftRoutes from "./routes/shiftRoutes";
import paymentRoutes from "./routes/payment";
import pumpRoutes from "./routes/pumpRoutes";
import { attachRequesterContext, requirePumpContext } from "./middleware/pumpContext";

import authRoutes from "./routes/authRoutes";



// Load environment variables
dotenv.config();

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

      const isIpOrigin = /^https?:\/\/\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?$/.test(origin);
      if (
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        isIpOrigin
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
app.use(attachRequesterContext);
// -------------------
// 🛣️ API Routes
// -------------------
app.use("/api/pumps", pumpRoutes);
app.use("/api/sales", requirePumpContext, saleRoutes);
app.use("/api/tanks", requirePumpContext, tankRoutes);
app.use("/api/finance", requirePumpContext, financeRoutes);
app.use("/api/payroll", requirePumpContext, payrollRoutes);
app.use("/api", requirePumpContext, creditRoutes);
app.use("/api", adminRoutes);
app.use("/api", requirePumpContext, dashboardRoutes);
app.use("/api/fuel-rates", requirePumpContext, fuelRateRoutes);
app.use("/api/machines", requirePumpContext, machineRoutes);
app.use("/api/tank-master", requirePumpContext, addtankRoutes);
app.use("/api/fueltest", requirePumpContext, fuelTestRoutes);
app.use("/api/shifts", requirePumpContext, shiftRoutes);
app.use("/api/payments", requirePumpContext, paymentRoutes);




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

const startServer = async () => {
  try {
    // Ensure database and compatibility migrations are ready before serving traffic.
    await connectDB();

    // Render requires your app to *always* listen on process.env.PORT
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

// Export only if needed for testing
export default app;
