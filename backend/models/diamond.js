import { Schema, model } from "mongoose";

const diamondSchema = new Schema({
  stockNumber: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["Natural", "Lab Grown"],
    required: true
  },
  shape: {
    type: String,
    enum: ["Round", "Princess", "Cushion", "Emerald", "Oval", "Radiant", "Asscher", "Marquise", "Heart", "Pear"],
    required: true
  },
  cut: {
    type: String,
    enum: ["Excellent", "Very Good", "Good", "Fair", "Poor"]
  },
  color: {
    type: String,
    enum: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]
  },
  clarity: {
    type: String,
    enum: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"]
  },
  carat: { type: Number },
  price: { type: Number },
  fluorescence: {
    type: String,
    enum: ["None", "Faint", "Medium", "Strong", "Very Strong"]
  },
  polish: {
    type: String,
    enum: ["Excellent", "Very Good", "Good", "Fair", "Poor"]
  },
  symmetry: {
    type: String,
    enum: ["Excellent", "Very Good", "Good", "Fair", "Poor"]
  },
  table: { type: Number },
  depth: { type: Number },
  lengthWidthRatio: { type: Number },
  images: [{ type: String }], // Array of image URLs
  videos: [{ type: String }], // Array of video URLs
  certificationFiles: [{
    url: String,
    certificationType: { type: String, enum: ["GIA", "IGI", "AGS", "HRD", "Other"] },
    originalName: String
  }],
  stockStatus: {
    type: String,
    enum: ["In Stock", "Out of Stock", "Call for Availability"],
    default: "In Stock"
  },
  stockQuantity: { type: Number, default: 1 },
  showStockQuantity: { type: Boolean, default: false },
  imageUrl: { type: String }, // Kept for backward compatibility
  threeDModelUrl: { type: String }, // Changed from threeDModel to threeDModelUrl
  giaReport: { type: String },
  shipment: {
    type: String,
    enum: ["Standard", "Overnight", "Express"]
  },
  certification: {
    type: String,
    enum: ["GIA", "IGI", "AGS", "HRD"]
  }
}, {
  timestamps: true // Add timestamps for created and updated at
});

export default model("Diamond", diamondSchema);
