import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadOnCloudinary = async (fileBase64, folder = "job_portal", type = "raw") => {
  if (!fileBase64) throw new Error("No file provided");
  return await cloudinary.uploader.upload(fileBase64, { folder, resource_type: type });
};


export default cloudinary;
