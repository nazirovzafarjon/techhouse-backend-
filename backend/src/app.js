import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoutes.js";
import productRoute from "./routes/productRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

app.use("/api/auth", authRoute);
app.use("/api/products" , productRoute)

export default app;
