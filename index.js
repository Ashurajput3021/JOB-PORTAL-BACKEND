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
  origin: 'https://job-portal-frontend-d38l.vercel.app/',
  credentials: true 
};

app.use(cors(corsOption));

const PORT = process.env.PORT || 8000;

// API routes
app.get("/", (req,res)=>res.send("Backend is running ✅"));

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
