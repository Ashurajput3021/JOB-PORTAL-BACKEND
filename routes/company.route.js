import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCompany, getCompanies, getCompanyById } from "../controllers/company.controller.js";

const router = express.Router();

router.post("/create", isAuthenticated, createCompany);
router.get("/get", isAuthenticated, getCompanies);
router.get("/get/:id", isAuthenticated, getCompanyById);

export default router;
