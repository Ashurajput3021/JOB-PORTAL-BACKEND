import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoutes from "./routes/company.route.js"; 
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";

dotenv.config(); 

const app = express();

// ✅ Trust proxy for secure cookies on Render
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS for frontend
const corsOption = {
  origin: 'https://job-portal-frontend-six-lake.vercel.app',
  credentials: true 
};
app.use(cors(corsOption));

const PORT = process.env.PORT || 8000;

// Root route
app.get("/", (req, res) => res.send("Backend is running ✅"));

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoutes);  
app.use("/api/v1/job", jobRoute);  
app.use("/api/v1/application", applicationRoute);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found", success: false });
});

// Start server
app.listen(PORT, () => {
  console.log("Starting server...");
  connectDb();
  console.log(`Server running at port ${PORT}`);
});
