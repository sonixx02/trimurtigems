import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`); // Replace spaces to prevent issues
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    "image/jpeg": [".jpeg", ".jpg"],
    "image/jpg": [".jpg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "application/pdf": [".pdf"],
    "model/gltf-binary": [".glb"],
    "application/octet-stream": [".glb"], // Added to handle GLB files
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/webm": [".webm"]
  };

  const fileExt = path.extname(file.originalname).toLowerCase();

  // Check if the MIME type exists in allowedTypes and if the file extension matches
  const isValidMIME = Object.entries(allowedTypes).some(
    ([mimetype, extensions]) =>
      file.mimetype === mimetype && extensions.includes(fileExt)
  );

  console.log("File Info:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    extname: fileExt,
    isMIMEValid: isValidMIME
  });

  if (isValidMIME) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images (JPEG, JPG, PNG, GIF), PDFs, and 3D models (GLB) are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

export default upload;