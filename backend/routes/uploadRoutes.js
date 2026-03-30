const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");

// Upload file
router.post("/", auth, upload.single("file"), (req, res) => {
  res.json({
    fileUrl: req.file.path
  });
});

module.exports = router;