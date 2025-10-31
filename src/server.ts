import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import saleRoutes from "./routes/saleRoutes";
import tankRoutes from "./routes/tankRoutes";
import financeRoutes from "./routes/financeRoutes";
import creditRoutes from "./routes/creditLineRoutes";
import adminRoutes from "./routes/adminRoutes";
import payrollRoutes from "./routes/payrollRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/sales", saleRoutes);
app.use("/api/tanks", tankRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/payroll", payrollRoutes); // ✅ VERY IMPORTANT
app.use("/api", creditRoutes);
app.use("/api", adminRoutes);
app.use("/api", dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
