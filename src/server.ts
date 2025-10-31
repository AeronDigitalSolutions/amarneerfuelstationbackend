import express, { Application, Request, Response } from "express";
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

const app: Application = express();

// -------------------
// 🧩 Middleware
// -------------------
app.use(express.json());

// ✅ Configure CORS (allow frontend + local)
const allowedOrigins = [
  "https://amarneerfuelstationfrontend.vercel.app", // your frontend (on Vercel)
  "http://localhost:3000" // local dev
];

app.use(
  cors({
    origin: allowedOrigins,
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
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "🚀 Amar Neer Fuel Station Backend is running!" });
});

// -------------------
// 🚀 Start Server (for local)
// -------------------
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// -------------------
// ✅ Export for Vercel
// -------------------
export default app;
