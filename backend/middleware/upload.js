const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat_uploads",
    resource_type: "auto" // image, pdf, etc
  }
});

const upload = multer({ storage });

module.exports = upload;