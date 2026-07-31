import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js"
import authRoutes from "./src/features/auth/auth.Routes.js"
import cookieParser from "cookie-parser";
import uploadRoutes from "./src/features/imports/upload.Routes.js"
import productRoutes from "./src/features/products/product.Routes.js"
import orderRoutes from "./src/features/orders/order.Routes.js";
import userRoutes from "./src/features/users/user.Routes.js";
import customerRoutes from "./src/features/customers/customer.Routes.js"
import regionalRoutes from "./src/features/regional/regional.Routes.js"
import inventoryRoutes from "./src/features/inventory/inventory.routes.js"
import reportRoutes from "./src/features/reports/report.routes.js"
import notificationRoutes from "./src/features/notifications/notificationRoutes.js"; // fixed: was missing "src/"
import errorHandler from "./src/middleware/errorMiddleware.js"
import aiRoutes from "./src/features/chatbot/ai.routes.js";


dotenv.config();
console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
connectDB();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean); 

app.use(
  cors({
    origin: (origin, callback) => {
      
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.warn("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
app.use(cookieParser());
app.use(
  express.json({
    limit: "100mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "100mb",
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.use(
  "/api/products",
  productRoutes
);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers",customerRoutes)
app.use("/api/regional",regionalRoutes)
app.use("/api/inventory",inventoryRoutes)
app.use("/api/reports",reportRoutes)
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
  res.send("API Running");
});
app.get("/cookie-test", (req, res) => {
  res.cookie("testCookie", "hello", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.send("cookie set");
});
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});