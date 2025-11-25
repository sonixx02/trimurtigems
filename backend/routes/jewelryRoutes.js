import { Router } from "express";
import mongoose from "mongoose";
import Jewelry from "../models/jewelry.js";
import upload from "../middleware/uploadMiddleware.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to safely delete files
const safeDelete = (filePath) => {
    if (!filePath) return;
    try {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (unlinkErr) {
        console.warn(`Could not delete file ${filePath}:`, unlinkErr.message);
    }
};

// ✅ Create Jewelry Item
router.post("/create", async (req, res) => {
    try {
        const jewelry = new Jewelry(req.body);
        await jewelry.save();
        res.status(201).json({ message: "Jewelry item created successfully", jewelry });
    } catch (err) {
        console.error("Create Jewelry Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ Upload Files for Jewelry
// Supports multiple images and one 3D model
router.post("/upload", upload.fields([
    { name: "images" },
    { name: "videos" },
    { name: "certificationFiles" },
    { name: "threeDModel", maxCount: 1 }
]), async (req, res) => {
    try {
        const { jewelryId } = req.body;

        if (!jewelryId || !mongoose.Types.ObjectId.isValid(jewelryId)) {
            return res.status(400).json({ message: "Invalid or missing Jewelry ID." });
        }

        const jewelry = await Jewelry.findById(jewelryId);
        if (!jewelry) {
            return res.status(404).json({ message: "Jewelry item not found." });
        }

        const updateData = {};

        // Handle Images - append to existing array
        if (req.files.images) {
            const newImagePaths = req.files.images.map(file => `/uploads/${file.filename}`);
            updateData.$push = { images: { $each: newImagePaths } };
        }

        // Handle Videos - append to existing array
        if (req.files.videos) {
            const newVideoPaths = req.files.videos.map(file => `/uploads/${file.filename}`);
            if (!updateData.$push) updateData.$push = {};
            updateData.$push.videos = { $each: newVideoPaths };
        }

        // Handle Certification Files - append to existing array
        if (req.files.certificationFiles) {
            const newCertFiles = req.files.certificationFiles.map(file => ({
                url: `/uploads/${file.filename}`,
                originalName: file.originalname
            }));
            if (!updateData.$push) updateData.$push = {};
            updateData.$push.certificationFiles = { $each: newCertFiles };
        }

        // Handle 3D Model (Replace existing)
        if (req.files.threeDModel) {
            safeDelete(jewelry.threeDModelUrl);
            updateData.threeDModelUrl = `/uploads/${req.files.threeDModel[0].filename}`;
        }

        const updatedJewelry = await Jewelry.findByIdAndUpdate(
            jewelryId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Files uploaded successfully.",
            jewelry: updatedJewelry
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ Get All Jewelry (with optional category filter)
router.get("/", async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category: { $regex: new RegExp(`^${category}$`, "i") } } : {};

        const jewelryItems = await Jewelry.find(filter).sort({ createdAt: -1 });
        res.json(jewelryItems);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ Get Jewelry by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }
        const jewelry = await Jewelry.findById(id);
        if (!jewelry) {
            return res.status(404).json({ message: "Jewelry item not found." });
        }
        res.json({ message: "Jewelry fetched successfully", jewelry });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ Update Jewelry
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }

        const updatedJewelry = await Jewelry.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedJewelry) {
            return res.status(404).json({ message: "Jewelry item not found." });
        }

        res.json({ message: "Jewelry updated successfully", jewelry: updatedJewelry });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ✅ Delete Jewelry
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }

        const jewelry = await Jewelry.findById(id);
        if (!jewelry) {
            return res.status(404).json({ message: "Jewelry item not found." });
        }

        // Delete associated files
        if (jewelry.images && jewelry.images.length > 0) {
            jewelry.images.forEach(img => safeDelete(img));
        }
        safeDelete(jewelry.threeDModelUrl);

        await Jewelry.findByIdAndDelete(id);

        res.json({ message: "Jewelry deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
