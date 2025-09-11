import multer from "multer";

const storage = multer.memoryStorage();

// ✅ User signup profile photo
export const singleUpload = multer({ storage }).single("profilePhoto");

// ✅ Resume + profile photo update
export const multiUpload = multer({ storage }).fields([
  { name: "resume", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]);

// ✅ Company logo
export const companyLogoUpload = multer({ storage }).single("logo");
