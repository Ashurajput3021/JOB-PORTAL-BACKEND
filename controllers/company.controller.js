import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Register a company
export const registerCompany = async (req, res) => {
  try {
    const { name } = req.body; // ✅ backend expects 'name'

    if (!name) {
      return res.status(400).json({ message: "Company name is required.", success: false });
    }

    const existing = await Company.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Company already exists.", success: false });
    }

    let logoUrl = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const uploaded = await uploadOnCloudinary(fileUri, "company_logos");
      logoUrl = uploaded.secure_url;
    }

    const company = await Company.create({
      name,
      userId: req.id,
      logo: logoUrl,
    });

    return res.status(201).json({
      message: "Company registered successfully.",
      success: true,
      company,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Get all companies for logged-in user
export const getCompany = async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.id });
    if (!companies.length) {
      return res.status(404).json({ message: "No companies found.", success: false });
    }
    return res.status(200).json({ success: true, companies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found", success: false });
    return res.status(200).json({ success: true, company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, website, location } = req.body;

    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: "Company not found", success: false });

    const updateData = {
      name: name || company.name,
      description: description || company.description,
      website: website || company.website,
      location: location || company.location,
    };

    if (req.file) {
      const fileUri = getDataUri(req.file);
      const uploaded = await uploadOnCloudinary(fileUri, "company_logos");
      updateData.logo = uploaded?.secure_url || company.logo;
    }

    const updated = await Company.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({ message: "Company updated successfully", success: true, company: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", success: false });
  }
};
