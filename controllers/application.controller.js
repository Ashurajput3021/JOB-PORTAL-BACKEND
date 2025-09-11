import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

// Apply for a job
export const applyJob = async (req, resp) => {
  try {
    const userId = req.id; // logged-in user
    const jobId = req.params.id;

    if (!jobId) {
      return resp.status(400).json({ message: "Job id is required.", success: false });
    }

    // check if already applied
    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) {
      return resp.status(400).json({ message: "You have already applied for this job.", success: false });
    }

    // create new application
    const newApplication = await Application.create({ job: jobId, applicant: userId });

    // push to job's applications array
    const jobData = await Job.findById(jobId);
    if (!jobData) return resp.status(404).json({ message: "Job not found", success: false });

    if (!jobData.applications) jobData.applications = [];
    jobData.applications.push(newApplication._id);
    await jobData.save();

    // ✅ populate applications for frontend
    const updatedJob = await Job.findById(jobId)
      .populate({
        path: "applications",
        populate: { path: "applicant", select: "fullname email" }, // ✅ applicant use kar
        options: { sort: { createdAt: -1 } },
      });

    return resp.status(201).json({
      message: "Job applied successfully.",
      success: true,
      job: updatedJob, // frontend ke liye
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error", success: false });
  }
};

// Get logged-in user's applications
export const getApplication = async (req, resp) => {
  try {
    const userId = req.id;

    const application = await Application.find({ applicant: userId }) // ✅ applicant use kar
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        populate: {
          path: "company",
          options: { sort: { createdAt: -1 } }
        }
      });

    if (!application || application.length === 0) {
      return resp.status(404).json({ message: "No Applications.", success: false });
    }

    return resp.status(200).json({ application, success: true });

  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error", success: false });
  }
};

// Admin: Get all applicants for a job
export const getApplicants = async (req, resp) => {
  try {
    const { id: jobId } = req.params;

    const jobData = await Job.findById(jobId)
      .populate({
        path: "applications",
        populate: {
          path: "applicant", // ✅ applicant use kar
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!jobData) {
      return resp.status(404).json({ message: "Job not found", success: false });
    }

    return resp.status(200).json({ job: jobData, success: true });

  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error", success: false });
  }
};

// Update application status (admin)
export const updateStatus = async (req, resp) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!status) {
      return resp.status(400).json({ message: "Status is required", success: false });
    }

    const applicant = await Application.findById(applicationId);
    if (!applicant) {
      return resp.status(404).json({ message: "Application not found", success: false });
    }

    applicant.status = status.toLowerCase();
    await applicant.save();

    return resp.status(200).json({ message: "Status updated successfully.", success: true });

  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error", success: false });
  }
};
