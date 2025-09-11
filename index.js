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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOption = {
  origin: 'http://localhost:5173',
  credentials: true 
};

app.use(cors(corsOption));

const PORT = process.env.PORT || 3000;

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoutes);  
app.use("/api/v1/job",jobRoute);  
app.use("/api/v1/application/",applicationRoute);  

// Start server
app.listen(PORT, () => {
  console.log("Starting server...");
  connectDb();
  console.log(`Server running at port ${PORT}`);
});
