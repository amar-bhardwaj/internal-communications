const webpush = require("web-push");
require("dotenv").config(); // 🔥 FORCE LOAD HERE ALSO

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  throw new Error("VAPID keys are missing in .env");
}

webpush.setVapidDetails(
  "mailto:admin@company.com",
  publicKey,
  privateKey
);

module.exports = webpush;