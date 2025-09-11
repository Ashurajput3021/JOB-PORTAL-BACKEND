import express from "express";
import { register, login, logout, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload, multiUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", singleUpload, register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/profile/update", isAuthenticated, multiUpload, updateProfile);

export default router;
