const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname
      .replace(ext, "")
      .replace(/\s+/g, "_");

    return {
      folder: "chat_uploads",
      resource_type: "auto",
      public_id: Date.now() + "-" + name,
      format: ext.replace(".", "") 
    };
  }
});

const upload = multer({ storage });

module.exports = upload;