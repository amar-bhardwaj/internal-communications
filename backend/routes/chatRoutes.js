const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const dept = require("../middleware/departmentMiddleware");
const upload = require("../middleware/upload");
const { getMessages, getPrivateMessages } = require("../controllers/chatController");

router.get("/group/:department", auth, dept, getMessages);
router.get("/private/:userId", auth, getPrivateMessages);

router.post("/upload", auth, upload.single("file"), (req, res) => {
  res.json({
    url: req.file.path
  });
});

module.exports = router;