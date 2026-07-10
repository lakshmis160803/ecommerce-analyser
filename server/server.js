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
dotenv.config();
connectDB();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
