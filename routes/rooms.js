const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const roomsController = require("../controllers/rooms");
const { ensureAuth } = require("../middleware/auth");

router.get("/:namespace/:room?", ensureAuth, roomsController.getRooms);

module.exports = router;