import multer               from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary           from "../config/cloudinary.js";
import path                 from "path";
import fs                   from "fs";

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
  process.env.CLOUDINARY_API_KEY    &&
  process.env.CLOUDINARY_API_KEY    !== "your_api_key"    &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== "your_api_secret";

console.log("Cloudinary configured:", isCloudinaryConfigured);

// Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder:          "shopverse/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation:  [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
  }),
});

// Local disk storage fallback
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const upload = multer({
  storage:    isCloudinaryConfigured ? cloudinaryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

console.log(
  isCloudinaryConfigured
    ? "Upload middleware: Cloudinary storage active"
    : "Upload middleware: Local disk storage active (check .env)"
);