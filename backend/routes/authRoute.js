const express = require("express");
const router = express.Router();

const {
    userRegister,
    userLogin,
    userLogout,
    wardenLogin,
    wardenLogout,
    adminLogin,
    adminLogout
} = require("../controllers/authController");


// ================= STUDENT =================

// register student
router.post("/register", userRegister);

// login student
router.post("/login", userLogin);

// logout student
router.post("/logout", userLogout);


// ================= WARDEN =================

// warden login
router.post("/warden/login", wardenLogin);

// warden logout
router.post("/warden/logout", wardenLogout);


// ================= ADMIN =================

// admin login
router.post("/admin/login", adminLogin);

// admin logout
router.post("/admin/logout", adminLogout);
console.log("Auth routes file loaded");

module.exports = router;