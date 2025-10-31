import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in environment");
  process.exit(1);
}
const uri = MONGO_URI!;

// Optional: prevent strictQuery deprecation warnings
mongoose.set("strictQuery", false);

export default async function connectDB() {
  try {
    // useNewUrlParser/useUnifiedTopology are on by default in recent mongoose versions
    const conn = await mongoose.connect(uri, {
      // pass additional options if you need them:
      // user: process.env.DB_USER,
      // pass: process.env.DB_PASS,
      // dbName: 'petrolpump', // optional if included in URI
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    // Optional: create indexes or initial data here
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    // keep process alive if you want to allow retries (or exit)
    process.exit(1);
  }

  // graceful shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  });
}
