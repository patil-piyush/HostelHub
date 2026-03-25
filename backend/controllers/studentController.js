const {
    Student,
    Complaint,
    Leave,
    Movement,
    Room,
    RoomSelection,
    AllocationCycle,
    StudentAllocation
} = require('../models');

const sequelize = require('../config/database');

// PROFILE 

exports.getProfile = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.id, {
            attributes: {
                exclude: [
                    "password",
                    "createdAt",
                    "updatedAt",
                    "RoomId"
                ]
            },
            include: [
                {
                    model: Room,
                    attributes: ["roomNumber"] // only required data
                }
            ]
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const student = await Student.findByPk(req.user.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // ✅ Only allow valid fields (VERY IMPORTANT)
        const allowedFields = [
            "name",
            "email",
            "contactNumber",
            "branch",
            "year",
            "CGPA",
            "permanentAddress",
            "currentAddress",
            "parentName",
            "parentEmail",
            "parentContactNumber",
            "guardianName",
            "guardianEmail",
            "guardianContactNumber",
            "guardianAddress"
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {

                let value = req.body[field];

                // ✅ Convert CGPA safely
                if (field === "CGPA") {
                    value = Number(value);
                    if (isNaN(value)) return; // skip invalid
                }

                // ✅ Avoid empty strings
                if (value !== "") {
                    updateData[field] = value;
                }
            }
        });

        await student.update(updateData);
        
        console.log("REQ BODY:", req.body);

        // ✅ Optional: auto profile completion logic
        const isComplete = allowedFields.every(
            (field) => student[field] !== null && student[field] !== ""
        );

        student.profileCompleted = isComplete;
        await student.save();

        // ✅ Return clean response
        const updatedStudent = await Student.findByPk(req.user.id, {
            attributes: {
                exclude: [
                    "password",
                    "createdAt",
                    "updatedAt",
                    "RoomId"
                ]
            },
            include: [
                {
                    model: Room,
                    attributes: ["roomNumber"]
                }
            ]
        });

        res.json({
            message: "Profile updated successfully",
            student: updatedStudent
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};


exports.updateHostelPreference = async (req, res) => {

    try {

        const { wantsHostelNextYear } = req.body;

        const student = await Student.findByPk(req.user.id);

        student.wantsHostelNextYear = wantsHostelNextYear;

        await student.save();

        res.json({ message: "Hostel preference updated" });

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};



/* =====================================================
                    ROOM SECTION
===================================================== */

exports.getMyRoom = async (req, res) => {

    try {

        const student = await Student.findByPk(req.user.id, {
            include: [Room]
        });

        res.json(student.Room);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};


exports.getAvailableRooms = async (req, res) => {

    try {

        const cycle = await AllocationCycle.findOne({
            where: { status: "selection_open" }
        });

        if (!cycle) {
            return res.status(400).json({
                message: "Room selection not open"
            });
        }

        const rooms = await Room.findAll({
            where: {
                AllocationCycleId: cycle.id,
                status: "available"
            }
        });

        const availableRooms = rooms.filter(
            room => room.occupiedBeds < room.capacity
        );

        res.json(availableRooms);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};



exports.selectRoom = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {

        const { roomNumber } = req.body;

        const student = await Student.findByPk(req.user.id, { transaction });

        if (student.RoomId) {
            return res.status(400).json({
                message: "Room already allocated"
            });
        }

        const cycle = await AllocationCycle.findOne({
            where: { status: "selection_open" },
            transaction
        });

        if (!cycle) {
            return res.status(400).json({
                message: "Room selection not active"
            });
        }

        const allocation = await StudentAllocation.findOne({
            where: {
                StudentId: student.id,
                AllocationCycleId: cycle.id
            },
            transaction
        });

        if (!allocation || allocation.status !== "eligible") {
            return res.status(403).json({
                message: "Student not eligible for room selection"
            });
        }

        const room = await Room.findOne({
            where: {
                roomNumber,
                AllocationCycleId: cycle.id
            },
            transaction
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        if (room.status === "reserved") {
            return res.status(400).json({
                message: "Room reserved for freshers"
            });
        }

        if (room.occupiedBeds >= room.capacity) {
            return res.status(400).json({
                message: "Room full"
            });
        }

        room.occupiedBeds += 1;

        if (room.occupiedBeds === room.capacity) {
            room.status = "full";
        }

        student.RoomId = room.id;

        allocation.status = "allocated";

        await RoomSelection.create({
            StudentId: student.id,
            RoomId: room.id,
            AllocationCycleId: cycle.id
        }, { transaction });

        await room.save({ transaction });
        await student.save({ transaction });
        await allocation.save({ transaction });

        await transaction.commit();

        res.json({
            message: "Room allocated successfully",
            roomNumber: room.roomNumber
        });

    } catch (error) {

        await transaction.rollback();

        res.status(500).json({
            message: error.message
        });

    }

};



/* =====================================================
                    COMPLAINT
===================================================== */

exports.submitComplaint = async (req, res) => {

    try {

        const { title, description, category } = req.body;

        const complaint = await Complaint.create({
            title,
            description,
            category,
            StudentId: req.user.id
        });

        res.status(201).json(complaint);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};


exports.getMyComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.findAll({
            where: { StudentId: req.user.id }
        });

        res.json(complaints);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};


exports.getComplaintById = async (req, res) => {

    try {

        const complaint = await Complaint.findOne({
            where: {
                id: req.params.id,
                StudentId: req.user.id
            }
        });

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(complaint);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};



/* =====================================================
                        LEAVE
===================================================== */

exports.applyLeave = async (req, res) => {

    try {

        const { startDate, endDate, reason } = req.body;

        const leave = await Leave.create({
            startDate,
            endDate,
            reason,
            StudentId: req.user.id
        });

        res.status(201).json(leave);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};


exports.getMyLeaveApplications = async (req, res) => {

    try {

        const leaves = await Leave.findAll({
            where: { StudentId: req.user.id }
        });

        res.json(leaves);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};


exports.getLeaveById = async (req, res) => {

    try {

        const leave = await Leave.findOne({
            where: {
                id: req.params.id,
                StudentId: req.user.id
            }
        });

        if (!leave) {
            return res.status(404).json({ message: "Leave not found" });
        }

        res.json(leave);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};



// MOVEMENT

exports.markOut = async (req, res) => {

    try {

        const lastMovement = await Movement.findOne({
            where: {
                StudentId: req.user.id,
                status: "OUT"
            }
        });

        if (lastMovement) {
            return res.status(400).json({
                message: "Already marked OUT"
            });
        }

        const movement = await Movement.create({
            outTime: new Date(),
            reason: req.body.reason,
            StudentId: req.user.id
        });

        res.json(movement);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};


exports.markIn = async (req, res) => {

    try {

        const movement = await Movement.findOne({
            where: {
                StudentId: req.user.id,
                status: "OUT"
            },
            order: [["createdAt", "DESC"]]
        });

        if (!movement) {
            return res.status(400).json({
                message: "No OUT entry found"
            });
        }

        movement.status = "IN";
        movement.inTime = new Date();

        await movement.save();

        res.json({
            message: "Marked IN successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};


exports.getMovementHistory = async (req, res) => {

    try {

        const movements = await Movement.findAll({
            where: { StudentId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json(movements);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};