import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// -------- REGISTER --------
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "All fields required", success: false });
    }

    // check duplicate email or fullname
    const userExists = await User.findOne({ $or: [{ email }, { fullname }] });
    if (userExists) {
      return res.status(400).json({
        message: "User with same email or fullname already exists",
        success: false
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Profile photo is required", success: false });
    }

    // Upload profile photo
    const fileUri = getDataUri(req.file);
    const uploaded = await uploadOnCloudinary(fileUri, "avatars");
    const profilePhotoUrl = uploaded?.secure_url;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      phoneNumber: phoneNumber.toString(),
      password: hashedPassword,
      role,
      profile: { profilePhoto: profilePhotoUrl },
    });

    return res
      .status(201)
      .json({ message: "Account created", success: true, user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// -------- LOGIN --------
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect email or password", success: false });
    }

    if (role !== user.role) {
      return res.status(400).json({ message: "Role mismatch", success: false });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // ✅ Set cookie for cross-site (Vercel → Render)
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 86400000, // 1 day
        httpOnly: true,
        sameSite: "none", // ✅ allow cross-site
        secure: true      // ✅ required for HTTPS
      })
      .json({ message: `Welcome back ${user.fullname}`, success: true, user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// -------- LOGOUT --------
export const logout = async (_req, res) => {
  return res
    .status(200)
    .cookie("token", "", { maxAge: 0, httpOnly: true, sameSite: "none", secure: true })
    .json({ message: "Logged out", success: true });
};

// -------- UPDATE PROFILE --------
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id; // from auth middleware
    const { fullname, email, phoneNumber, bio, skills } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber.toString();
    if (bio !== undefined) user.profile.bio = bio;

    if (skills) {
      if (typeof skills === "string") {
        try {
          const parsed = JSON.parse(skills);
          user.profile.skills = Array.isArray(parsed) ? parsed : [];
        } catch {
          user.profile.skills = skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(skills)) {
        user.profile.skills = skills.map((s) => s.trim());
      }
    }

    if (req.files?.profilePhoto?.[0]) {
      const fileUri = getDataUri(req.files.profilePhoto[0]);
      const uploaded = await uploadOnCloudinary(fileUri, "avatars");
      user.profile.profilePhoto = uploaded?.secure_url || user.profile.profilePhoto;
    }

    if (req.files?.resume?.[0]) {
      const fileUri = getDataUri(req.files.resume[0]);
      const uploaded = await uploadOnCloudinary(fileUri, "resumes", "raw");
      user.profile.resume = uploaded?.secure_url;
      user.profile.resumeOriginalName = req.files.resume[0].originalname;
      console.log("Resume uploaded to Cloudinary:", uploaded?.secure_url);
    }

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
