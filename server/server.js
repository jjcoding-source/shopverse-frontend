import dotenv from "dotenv";
dotenv.config();

import "express-async-errors";
import express        from "express";
import mongoose       from "mongoose";
import cors           from "cors";
import helmet         from "helmet";
import morgan         from "morgan";
import cookieParser   from "cookie-parser";
import connectDB      from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes     from "./routes/authRoutes.js";
import productRoutes  from "./routes/productRoutes.js";
import orderRoutes    from "./routes/orderRoutes.js";
import paymentRoutes  from "./routes/paymentRoutes.js";
import reviewRoutes   from "./routes/reviewRoutes.js";
import adminRoutes    from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// ── Global middleware ──
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(
  cors({
    origin:      process.env.CLIENT_URL,
    credentials: true,
    methods:     ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// ── Routes ──
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews",  reviewRoutes);
app.use("/api/admin",    adminRoutes);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({
    status:      "ok",
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

// ── Error handling ──
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});