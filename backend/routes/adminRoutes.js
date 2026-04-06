const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const adminController = require("../controllers/adminController");
const allocationCycleController = require("../controllers/allocationCycleController");

const { verifyAdmin } = require("../middleware/adminMiddleware");
const { Room, Floor, Student } = require("../models");


// ================= DASHBOARD =================
router.get("/dashboard", verifyAdmin, adminController.getDashboardData);


// ================= WARDEN =================
router.post("/wardens", verifyAdmin, adminController.registerWarden);
router.get("/wardens", verifyAdmin, adminController.getAllWardens);
router.put("/wardens/:id", verifyAdmin, adminController.updateWarden);
router.delete("/wardens/:id", verifyAdmin, adminController.deleteWarden);


// ================= STUDENTS =================
router.get("/students", verifyAdmin, adminController.getAllStudents);

// 🔥 UPDATED: USE roomId internally (NOT roomNumber)
router.post("/students/change-room", verifyAdmin, adminController.changeStudentRoom);

router.get("/students/:id", verifyAdmin, adminController.getStudentById);
router.put("/students/:id", verifyAdmin, adminController.updateStudent);
router.delete("/students/:id", verifyAdmin, adminController.deleteStudent);


// ================= COMPLAINTS =================
router.get("/complaints", verifyAdmin, adminController.getAllComplaints);
router.get("/complaints/:id", verifyAdmin, adminController.getComplaintById);
router.put("/complaints/:id", verifyAdmin, adminController.updateComplaintStatus);
router.delete("/complaints/:id", verifyAdmin, adminController.deleteComplaint);


// ======================================================
//            ALLOCATION CYCLE MANAGEMENT
// ======================================================

// CREATE
router.post("/allocation-cycle", verifyAdmin, allocationCycleController.createCycle);

// GET
router.get("/allocation-cycle/latest", verifyAdmin, allocationCycleController.getLatestCycle);
router.get("/allocation-cycle", verifyAdmin, allocationCycleController.getAllCycles);

// MERIT
router.post("/allocation-cycle/generate-merit", verifyAdmin, allocationCycleController.generateMeritList);
router.get("/allocation-cycle/:cycleId/merit-list", verifyAdmin, allocationCycleController.getMeritList);

// ELIGIBILITY
router.post("/allocation-cycle/set-eligible", verifyAdmin, allocationCycleController.setEligibleStudents);

// SELECTION
router.post("/allocation-cycle/open-selection", verifyAdmin, allocationCycleController.openRoomSelection);
router.post("/allocation-cycle/close-selection", verifyAdmin, allocationCycleController.closeRoomSelection);
router.post("/allocation-cycle/complete", verifyAdmin, allocationCycleController.completeCycle);

// CSV UPLOAD
router.post("/allocation-cycle/upload-cgpa", verifyAdmin, upload.single("file"), adminController.uploadCgpaCsv);


// ======================================================
//                 ROOM FETCH (VISUALIZER)
// ======================================================

router.get("/rooms/:cycleId", verifyAdmin, async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { AllocationCycleId: req.params.cycleId },

      include: [
        {
          model: Floor,
          attributes: ["floorNumber"]
        },
        {
          model: Student,
          as: "Students",
          attributes: ["id", "name", "PRN"],
          required: false
        }
      ],

      order: [
        [Floor, "floorNumber", "ASC"],
        ["roomNumber", "ASC"]
      ]
    });

    // ✅ Normalize response
    const formatted = rooms.map(room => ({
      ...room.toJSON(),
      Students: room.Students || [],
      occupiedBeds: room.occupiedBeds || 0
    }));

    res.json(formatted);

  } catch (err) {
    console.error("ROOM FETCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});



// 🔥 USE THIS ONLY (PRIMARY API)
router.post("/allocate-room", verifyAdmin, adminController.allocateRoom);

// 🔥 REMOVE STUDENT FROM ROOM
router.post("/remove-student-room", verifyAdmin, adminController.removeStudentFromRoom);


module.exports = router;