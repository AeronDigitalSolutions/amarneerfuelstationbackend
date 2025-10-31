import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
// import authRoutes from "./routes/authRoutes";
// import salesRoutes from "./routes/salesRoutes";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/sales", salesRoutes);

app.get("/", (_, res) => res.send("Petrol Pump API running"));

export default app;
