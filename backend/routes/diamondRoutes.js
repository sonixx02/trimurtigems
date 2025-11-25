import { Router } from "express";
import mongoose from "mongoose";
import Diamond from "../models/diamond.js";
import upload from "../middleware/uploadMiddleware.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Upload Files for Diamond (Images, Videos, PDFs, 3D Model)
router.post("/upload/:id", upload.fields([
  { name: 'normalImage' },
  { name: 'images' },
  { name: 'videos' },
  { name: 'certificationFiles' },
  { name: 'pdfFile' },
  { name: 'threeDModel' }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    const updateData = {};

    // Helper to delete old file if it exists
    const safeDelete = (filePath) => {
      if (filePath) {
        const fullPath = path.join(__dirname, "..", filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    };

    // Find the diamond
    const diamond = await Diamond.findById(id);
    if (!diamond) {
      return res.status(404).json({ message: "Diamond not found" });
    }

    if (files.normalImage) {
      updateData.imageUrl = `/uploads/${files.normalImage[0].filename}`;
    }

    if (files.images) {
      const newImages = files.images.map(file => `/uploads/${file.filename}`);
      updateData.$push = { images: { $each: newImages } };
    }

    if (files.videos) {
      const newVideos = files.videos.map(file => `/uploads/${file.filename}`);
      if (!updateData.$push) updateData.$push = {};
      updateData.$push.videos = { $each: newVideos };
    }

    if (files.certificationFiles) {
      const newCertFiles = files.certificationFiles.map(file => ({
        url: `/uploads/${file.filename}`,
        originalName: file.originalname
      }));
      if (!updateData.$push) updateData.$push = {};
      updateData.$push.certificationFiles = { $each: newCertFiles };
    }

    if (files.pdfFile) {
      updateData.giaReport = `/uploads/${files.pdfFile[0].filename}`;
    }

    if (files.threeDModel) {
      safeDelete(diamond.threeDModelUrl);
      updateData.threeDModelUrl = `/uploads/${files.threeDModel[0].filename}`;
    }

    // Update the diamond with new file paths
    const updatedDiamond = await Diamond.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ message: "Files uploaded successfully", diamond: updatedDiamond });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "File upload failed", error: err.message });
  }
});

// ✅ Create a Diamond
router.post("/create", async (req, res) => {
  try {
    const diamond = new Diamond(req.body);
    await diamond.save();
    res.status(201).json({ message: "Diamond created successfully", diamond });
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get all Diamonds with optional filters
router.get("/", async (req, res) => {
  try {
    const { shape, minPrice, maxPrice, minCarat, maxCarat, color, clarity, cut } = req.query;
    const filter = {};

    if (shape) filter.shape = { $regex: new RegExp(`^${shape}$`, "i") };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minCarat || maxCarat) {
      filter.carat = {};
      if (minCarat) filter.carat.$gte = Number(minCarat);
      if (maxCarat) filter.carat.$lte = Number(maxCarat);
    }
    if (color) filter.color = { $in: color.split(",") };
    if (clarity) filter.clarity = { $in: clarity.split(",") };
    if (cut) filter.cut = { $in: cut.split(",") };

    const diamonds = await Diamond.find(filter);
    res.json(diamonds);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get a Diamond by ID (Universal)
router.get("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid diamond ID format." });
    }
    const diamond = await Diamond.findById(id);
    if (!diamond) {
      return res.status(404).json({ message: "Diamond not found." });
    }
    res.json({ message: "Diamond fetched successfully", diamond });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Get a Diamond by ID and Shape (Legacy/Frontend specific)
router.get("/:shape/:id", async (req, res) => {
  try {
    const { shape, id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid diamond ID format." });
    }

    // Create a filter for shape (case-insensitive)
    const filter = shape ? { shape: { $regex: new RegExp(`^${shape}$`, "i") } } : {};

    // Find the diamond by both shape and ID
    const diamond = await Diamond.findOne({ _id: id, ...filter });

    if (!diamond) {
      return res.status(404).json({ message: "Diamond not found." });
    }

    res.json({ message: "Diamond fetched successfully", diamond });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update a Diamond
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid diamond ID format." });
    }

    // Find and update the diamond
    const updatedDiamond = await Diamond.findByIdAndUpdate(id, req.body, {
      new: true, // Returns the updated document
      runValidators: true, // Ensure validation runs
    });

    if (!updatedDiamond) {
      return res.status(404).json({ message: "Diamond not found." });
    }

    res.json({ message: "Diamond updated successfully", diamond: updatedDiamond });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Delete a Diamond
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid diamond ID format." });
    }

    const diamond = await Diamond.findByIdAndDelete(req.params.id);

    if (!diamond) {
      return res.status(404).json({ message: "Diamond not found." });
    }

    res.json({ message: "Diamond deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;