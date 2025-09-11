import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, applyJob, updateJob } from "../controllers/job.controller.js";

const router = express.Router();

router.post("/post", isAuthenticated, postJob);
router.get("/get", isAuthenticated, getAllJobs);
router.get("/admin/jobs", isAuthenticated, getAdminJobs);
router.get("/get/:id", isAuthenticated, getJobById);
router.post("/apply/:id", isAuthenticated, applyJob);
router.put("/update/:id", isAuthenticated, updateJob);

export default router;
