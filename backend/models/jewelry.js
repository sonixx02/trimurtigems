import { Schema, model } from "mongoose";

const jewelrySchema = new Schema({
    name: { type: String, required: true },
    stockNumber: { type: String, unique: true, required: true },
    category: {
        type: String,
        required: true,
        enum: ["Ring", "Necklace", "Earrings", "Bracelet", "Pendant", "Other"]
    },
    price: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }], // Array of image URLs
    videos: [{ type: String }], // Array of video URLs
    certificationFiles: [{
        url: String,
        certificationType: String,
        originalName: String
    }],
    threeDModelUrl: { type: String },

    // Common attributes
    metal: { type: String }, // e.g., "18k Gold", "Platinum"
    gemstone: { type: String }, // e.g., "Diamond", "Sapphire"

    // Dynamic specifications based on category
    // e.g., Ring Size, Chain Length, Clasp Type, etc.
    specifications: {
        type: Map,
        of: String
    },

    stockStatus: {
        type: String,
        enum: ["In Stock", "Out of Stock", "Call for Availability"],
        default: "In Stock"
    },
    stockQuantity: { type: Number, default: 1 },
    showStockQuantity: { type: Boolean, default: false },

    isSold: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default model("Jewelry", jewelrySchema);
