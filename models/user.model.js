import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true }, // ❌ not unique
    email: { type: String, required: true, unique: true }, // ✅ email unique
    phoneNumber: { type: Number, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "recruiter"], required: true },
    profile: {
      bio: { type: String, default: "" },
      skills: [{ type: String }],
      resume: { type: String },
      resumeOriginalName: { type: String },
      profilePhoto: { type: String, required: true }, // ✅ profile photo required
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
