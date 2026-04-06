const {
    AllocationCycle,
    Floor,
    Room,
    Student,
    StudentAllocation
} = require("../models");

const { STATES, canTransition } = require("../utils/allocationStateMachine");
const sequelize = require("../config/database");
const { Op } = require("sequelize");


// ================= HELPER =================
const getCycleOrThrow = async (cycleId) => {
    const cycle = await AllocationCycle.findByPk(cycleId);
    if (!cycle) throw new Error("Cycle not found");
    return cycle;
};


// ================= CREATE CYCLE =================
exports.createCycle = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        let {
            academicYear,
            floors,
            roomsPerFloor,
            roomCapacity,
            freshersReservedRooms
        } = req.body;

        console.log("BODY:", req.body); // 🔥 DEBUG

        floors = parseInt(floors);
        roomsPerFloor = parseInt(roomsPerFloor);
        roomCapacity = parseInt(roomCapacity || 3);
        freshersReservedRooms = parseInt(freshersReservedRooms || 0);
        // 🔥 PREVENT SAME YEAR DUPLICATE
        const existingYear = await AllocationCycle.findOne({
            where: { academicYear }
        });

        if (existingYear) {
            return res.status(400).json({
                message: "Cycle for this academic year already exists"
            });
        }
        // ✅ STRICT VALIDATION
        if (!academicYear) {
            return res.status(400).json({ message: "Academic year required" });
        }

        if (isNaN(floors) || floors <= 0) {
            return res.status(400).json({ message: "Invalid floors" });
        }

        if (isNaN(roomsPerFloor) || roomsPerFloor <= 0) {
            return res.status(400).json({ message: "Invalid roomsPerFloor" });
        }

        // ✅ ONLY ONE ACTIVE CYCLE
        const activeCycle = await AllocationCycle.findOne({
            where: {
                status: {
                    [Op.in]: ["draft", "merit_generated", "selection_open"]
                }
            }
        });

        if (activeCycle) {
            return res.status(400).json({
                message: "Active cycle already exists"
            });
        }

        const cycle = await AllocationCycle.create({
            academicYear,
            floors,
            roomsPerFloor,
            roomCapacity,
            freshersReservedRooms,
            status: "draft"
        }, { transaction });

        // FLOORS
        const floorList = [];

        for (let i = 0; i < floors; i++) {
            const floor = await Floor.create({
                floorNumber: i,
                AllocationCycleId: cycle.id
            }, { transaction });

            floorList.push(floor);
        }

        // ROOMS
        let reservedCounter = freshersReservedRooms;

        for (const floor of floorList) {
            for (let i = 1; i <= roomsPerFloor; i++) {

                const roomNumber = `${floor.floorNumber}-${String(i).padStart(3, "0")}`;

                const status = reservedCounter > 0 ? "reserved" : "available";

                await Room.create({
                    roomNumber,
                    capacity: roomCapacity,
                    occupiedBeds: 0,
                    status,
                    FloorId: floor.id,
                    AllocationCycleId: cycle.id
                }, { transaction });

                if (reservedCounter > 0) reservedCounter--;
            }
        }

        await transaction.commit();

        res.status(201).json({
            message: "Cycle created successfully",
            cycle
        });

    } catch (error) {

        await transaction.rollback();

        console.error("CREATE ERROR:", error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};


// ================= GET LATEST =================
exports.getLatestCycle = async (req, res) => {
    try {
        const cycle = await AllocationCycle.findOne({
            order: [["createdAt", "DESC"]]
        });

        if (!cycle) {
            return res.status(404).json({ message: "No cycle found" });
        }

        res.json(cycle);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ================= GET ALL =================
exports.getAllCycles = async (req, res) => {
    try {
        const cycles = await AllocationCycle.findAll({
            order: [["createdAt", "DESC"]]
        });

        res.json(cycles);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ================= GENERATE MERIT =================
exports.generateMeritList = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        const { cycleId } = req.body;
        const cycle = await getCycleOrThrow(cycleId);


        if (!canTransition(cycle.status, STATES.MERIT)) {
            return res.status(400).json({
                message: `Invalid transition from ${cycle.status}`
            });
        }

        const existing = await StudentAllocation.findOne({
            where: { AllocationCycleId: cycleId }
        });

        if (existing) {
            return res.status(400).json({ message: "Merit already generated" });
        }

        const students = await Student.findAll({
            order: [["CGPA", "DESC"]]
        });

        let rank = 1;

        for (const student of students) {
            await StudentAllocation.create({
                rank,
                sgpa: student.CGPA,
                StudentId: student.id,
                AllocationCycleId: cycleId,
                status: "waiting"
            }, { transaction });

            rank++;
        }

        cycle.status = "merit_generated";
        await cycle.save({ transaction });

        await transaction.commit();

        res.json({ message: "Merit generated successfully" });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};


// ================= SET ELIGIBLE =================
exports.setEligibleStudents = async (req, res) => {
    try {
      const { cycleId, eligibleCount } = req.body;
  
      const cycle = await getCycleOrThrow(cycleId);
  
      if (cycle.status !== "merit_generated") {
        return res.status(400).json({
          message: "Set eligibility after merit generation"
        });
      }
  
      const allocations = await StudentAllocation.findAll({
        where: { AllocationCycleId: cycleId },
        order: [["rank", "ASC"]]
      });
  
      allocations.forEach((a, i) => {
        a.status = i < eligibleCount ? "eligible" : "waiting";
      });
  
      await Promise.all(allocations.map(a => a.save()));
  
      cycle.eligibleStudents = eligibleCount;
      cycle.status = "eligible_set";
      await cycle.save();
  
      return res.json({ message: "Eligibility set successfully" }); // ✅ ONLY ONE
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };


// ================= OPEN SELECTION =================
exports.openRoomSelection = async (req, res) => {
    try {
        const { cycleId } = req.body;
        const cycle = await getCycleOrThrow(cycleId);

        // ✅ FIXED CONDITION
        const { STATES, canTransition } = require("../utils/allocationStateMachine");

        if (!canTransition(cycle.status, STATES.OPEN)) {
            return res.status(400).json({
                message: `Invalid transition from ${cycle.status}`
            });
        }

        cycle.status = "selection_open";
        cycle.selectionStartDate = new Date();

        await cycle.save();

        res.json({ message: "Selection opened" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= CLOSE SELECTION =================
exports.closeRoomSelection = async (req, res) => {

    try {

        const { cycleId } = req.body;
        const cycle = await getCycleOrThrow(cycleId);

        if (cycle.status !== "selection_open") {
            return res.status(400).json({
                message: "Selection not open"
            });
        }

        cycle.status = "selection_closed";
        cycle.selectionEndDate = new Date();

        await cycle.save();

        res.json({ message: "Selection closed" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= COMPLETE CYCLE =================
exports.completeCycle = async (req, res) => {

    try {

        const { cycleId } = req.body;
        const cycle = await getCycleOrThrow(cycleId);

        if (cycle.status !== "selection_closed") {
            return res.status(400).json({
                message: "Close selection first"
            });
        }

        cycle.status = "completed";
        await cycle.save();

        res.json({ message: "Cycle completed" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ================= GET MERIT =================
exports.getMeritList = async (req, res) => {

    try {

        const { cycleId } = req.params;

        const list = await StudentAllocation.findAll({
            where: { AllocationCycleId: cycleId },
            include: [{
                model: Student,
                attributes: ["id", "name", "PRN", "CGPA"]
            }],
            order: [["rank", "ASC"]]
        });

        res.json(list);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};