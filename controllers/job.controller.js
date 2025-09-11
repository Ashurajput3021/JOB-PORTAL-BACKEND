import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

export const postJob = async (req, res) => {
  try {
    console.log("DEBUG req.body --->", req.body); // ✅ check kya aa raha

    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;

    const userId = req.id;

    // Validate required fields
    if (
      !title?.trim() ||
      !description?.trim() ||
      !requirements?.trim() ||
      !salary?.trim() ||
      !location?.trim() ||
      !jobType?.trim() ||
      !experience?.trim() ||
      !position?.trim() ||
      !companyId
    ) {
      return res
        .status(400)
        .json({ message: "Something is missing", success: false });
    }

    // ✅ Handle salary (number or range)
    let parsedSalary = salary;
    if (typeof salary === "string" && salary.includes("-")) {
      const [min, max] = salary.split("-").map((s) => s.trim());
      if (isNaN(min) || isNaN(max)) {
        return res.status(400).json({
          message: "Salary range must be numeric (e.g., 8-10 or 50000-70000)",
          success: false,
        });
      }
      parsedSalary = `${min}-${max}`; // store as string
    } else if (!isNaN(Number(salary))) {
      parsedSalary = Number(salary); // store as number
    } else {
      return res.status(400).json({
        message: "Salary must be a number or range (e.g., 12 or 50000-70000)",
        success: false,
      });
    }

    // ✅ Create new job
    const newJob = await Job.create({
      title,
      description,
      requirements: Array.isArray(requirements)
        ? requirements
        : requirements.split(","),
      salary: salary,
      location,
      jobType,
      experienceLevel: experience, // string
      position: String(position),
      company: companyId,
      created_by: userId,
    });

    return res.status(201).json({
      message: "New job created successfully.",
      job: newJob,
      success: true,
    });
  } catch (error) {
    console.error("❌ Error in postJob:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// ✅ STUDENT: Get all jobs (with optional search keyword)
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
        { jobType: { $regex: keyword, $options: "i" } },
      ],
    };

    const jobsList = await Job.find(query)
      .populate("company", "name location logo")
      .sort({ createdAt: -1 });

    if (!jobsList.length) {
      return res.status(404).json({
        message: "No jobs found.",
        success: false,
      });
    }

    return res.status(200).json({
      jobs: jobsList,
      success: true,
    });
  } catch (error) {
    console.error("❌ Error in getAllJobs:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// ✅ STUDENT: Get a specific job by ID with applications populated
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Validate ObjectId
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid Job ID",
        success: false,
      });
    }

    const foundJob = await Job.findById(jobId)
      .populate("company", "name description website location logo")
      .populate({
        path: "applications",
        populate: {
          path: "applicant",
          select: "_id fullname email resume",
        },
        options: { sort: { createdAt: -1 } },
      });

    if (!foundJob) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    return res.status(200).json({
      job: foundJob,
      success: true,
    });
  } catch (error) {
    console.error("❌ Error in getJobById:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// ✅ ADMIN: Get all jobs created by this admin (with pagination)
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobsList = await Job.find({ created_by: adminId })
      .select("title createdAt company")
      .populate("company", "name location logo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments({ created_by: adminId });

    return res.status(200).json({
      jobs: jobsList,
      totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      success: true,
    });
  } catch (error) {
    console.error("❌ Error in getAdminJobs:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// ✅ STUDENT: Apply for a job
export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid Job ID",
        success: false,
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job.",
        success: false,
      });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: newApplication._id },
    });

    const updatedJob = await Job.findById(jobId)
      .populate("company", "name description website location logo")
      .populate({
        path: "applications",
        populate: {
          path: "applicant",
          select: "_id fullname email resume",
        },
        options: { sort: { createdAt: -1 } },
      });

    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
      job: updatedJob,
    });
  } catch (error) {
    console.log("❌ Error in applyJob:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ✅ ADMIN: Update job
export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const adminId = req.id;

    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid Job ID",
        success: false,
      });
    }

    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;

    const job = await Job.findOne({ _id: jobId, created_by: adminId });
    if (!job) {
      return res.status(404).json({
        message: "Job not found or not authorized",
        success: false,
      });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.requirements = requirements
      ? Array.isArray(requirements)
        ? requirements
        : requirements.split(",")
      : job.requirements;
    job.salary = salary || job.salary;
    job.location = location || job.location;
    job.jobType = jobType || job.jobType;
    job.experienceLevel = isNaN(experience) ? experience : Number(experience);
    job.position = position || job.position;
    job.company = companyId || job.company;

    await job.save();

    return res.status(200).json({
      message: "Job updated successfully ✅",
      success: true,
      job,
    });
  } catch (error) {
    console.error("❌ Error in updateJob:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
