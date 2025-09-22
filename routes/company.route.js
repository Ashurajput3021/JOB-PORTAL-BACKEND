import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { registerCompany, getCompany, getCompanyById, updateCompany } from "../controllers/company.controller.js";
import { companyLogoUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(isAuthenticated, companyLogoUpload, registerCompany);
router.route("/get").get(isAuthenticated, getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById);
router.route("/update/:id").put(isAuthenticated, companyLogoUpload, updateCompany);

export default router;
