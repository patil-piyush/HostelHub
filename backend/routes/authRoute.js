const express = require("express");
const router = express.Router();
const { userRegister, userLogin, wardenLogin, wardenLogout, userLogout, adminLogin, adminLogout } = require("../controller/authController");

// Register route
router.post("/register", userRegister);
// Login route
router.post("/login", userLogin);
// User logout route
router.post("/logout", userLogout);
// Warden login route
router.post("/warden/login", wardenLogin);
// Warden logout route
router.post("/warden/logout", wardenLogout);
// Admin login route
router.post("/admin/login", adminLogin);
// Admin logout route  
router.post("/admin/logout", adminLogout);


module.exports = router;