const bcrypt = require('bcryptjs');
const csv = require("csv-parser");
const fs = require("fs");
const { StudentAllocation } = require("../models");

const {
    Student,
    Warden,
    Complaint,
    Leave,
    Room
} = require('../models');


// ================= WARDEN MANAGEMENT =================

exports.registerWarden = async (req, res) => {

    try {

        const { name, email, password, contactNumber } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Required fields missing"
            });
        }

        const existing = await Warden.findOne({
            where: { email }
        });

        if (existing) {
            return res.status(409).json({
                message: "Warden already exists"
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        const warden = await Warden.create({
            name,
            email,
            password: hashed,
            contactNumber
        });

        res.status(201).json({
            message: "Warden created"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



exports.getAllWardens = async (req, res) => {

    try {

        const wardens = await Warden.findAll({
            attributes: { exclude: ["password"] }
        });

        res.json(wardens);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.updateWarden = async (req, res) => {

    try {

        const warden = await Warden.findByPk(req.params.id);

        if (!warden) {
            return res.status(404).json({
                message: "Warden not found"
            });
        }

        const { password, ...data } = req.body;

        await warden.update(data);

        res.json({
            message: "Warden updated successfully",
            warden
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.deleteWarden = async (req, res) => {

    try {

        const warden = await Warden.findByPk(req.params.id);

        if (!warden) {
            return res.status(404).json({
                message: "Warden not found"
            });
        }

        await warden.destroy();

        res.json({
            message: "Warden deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



// ================= STUDENT MANAGEMENT =================
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            include: [
                {
                    model: Room,
                    attributes: ["id", "roomNumber"]
                }
            ]
        });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




exports.getStudentById = async (req, res) => {

    try {

        const student = await Student.findByPk(req.params.id, {
            attributes: { exclude: ["password"] }
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(student);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.updateStudent = async (req, res) => {

    try {

        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const { password, ...data } = req.body;

        await student.update(data);

        res.json({
            message: "Student updated successfully",
            student
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.deleteStudent = async (req, res) => {

    try {

        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        await student.destroy();

        res.json({
            message: "Student deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



// ================= ROOM CHANGE (ADMIN POWER) =================

exports.changeStudentRoom = async (req, res) => {
    try {

        const { PRN, roomId } = req.body;

        const student = await Student.findOne({ where: { PRN } });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const newRoom = await Room.findByPk(roomId);

        if (!newRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        // REMOVE FROM OLD ROOM
        if (student.RoomId) {
            const oldRoom = await Room.findByPk(student.RoomId);

            if (oldRoom) {
                const oldCount = await Student.count({
                    where: { RoomId: oldRoom.id }
                });

                oldRoom.occupiedBeds = Math.max(0, oldCount - 1);

                if (oldRoom.occupiedBeds < oldRoom.capacity) {
                    oldRoom.status = "available";
                }

                await oldRoom.save();
            }
        }

        // CHECK NEW ROOM
        const currentCount = await Student.count({
            where: { RoomId: newRoom.id }
        });

        if (currentCount >= newRoom.capacity) {
            return res.status(400).json({ message: "Room is full" });
        }

        // ASSIGN ROOM
        student.RoomId = newRoom.id;
        await student.save();

        // SYNC ROOM
        const updatedCount = await Student.count({
            where: { RoomId: newRoom.id }
        });

        newRoom.occupiedBeds = updatedCount;

        newRoom.status =
            updatedCount >= newRoom.capacity ? "full" : "available";

        await newRoom.save();

        res.json({ message: "Student room updated successfully" });

    } catch (error) {
        console.error("CHANGE ROOM ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};



// ================= COMPLAINT MANAGEMENT =================

exports.getAllComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.findAll({
            order: [["createdAt", "DESC"]]
        });

        res.json(complaints);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.getComplaintById = async (req, res) => {

    try {

        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        res.json(complaint);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.updateComplaintStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const allowedStatuses = [
            "Open",
            "In Progress",
            "Resolved"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid complaint status"
            });
        }

        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        complaint.status = status;

        if (status === "Resolved") {
            complaint.resolvedAt = new Date();
        }

        await complaint.save();

        res.json({
            message: "Complaint updated successfully",
            complaint
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.deleteComplaint = async (req, res) => {

    try {

        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        await complaint.destroy();

        res.json({
            message: "Complaint deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



// ================= CGPA MANAGEMENT =================

exports.addCgpaData = async (req, res) => {

    try {

        const { studentId, CGPA } = req.body;

        if (!studentId || CGPA === undefined) {
            return res.status(400).json({
                message: "studentId and CGPA required"
            });
        }

        const student = await Student.findByPk(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        student.CGPA = CGPA;

        await student.save();

        res.json({
            message: "CGPA updated successfully",
            student
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};




exports.getDashboardData = async (req, res) => {
    try {
        // ================= BASIC COUNTS =================
        const totalStudents = await Student.count();
        const totalWardens = await Warden.count();

        const rooms = await Room.findAll();

        let totalRooms = rooms.length;
        let occupiedBeds = 0;
        let totalBeds = 0;

        rooms.forEach((room) => {
            occupiedBeds += room.occupiedBeds;
            totalBeds += room.capacity;
        });

        const occupancyRate =
            totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

        // ================= CGPA DISTRIBUTION =================
        const students = await Student.findAll();

        const cgpaRanges = {
            "9-10": 0,
            "8-9": 0,
            "7-8": 0,
            "6-7": 0,
            "<6": 0,
        };

        students.forEach((s) => {
            const cg = s.CGPA || 0;

            if (cg >= 9) cgpaRanges["9-10"]++;
            else if (cg >= 8) cgpaRanges["8-9"]++;
            else if (cg >= 7) cgpaRanges["7-8"]++;
            else if (cg >= 6) cgpaRanges["6-7"]++;
            else cgpaRanges["<6"]++;
        });

        const cgpaData = Object.keys(cgpaRanges).map((key) => ({
            range: key,
            count: cgpaRanges[key],
        }));

        // ================= BLOCK OCCUPANCY =================
        // NOTE: using floor as block
        const blockMap = {};

        rooms.forEach((room) => {
            const block = `Block ${room.FloorId || "X"}`;

            if (!blockMap[block]) {
                blockMap[block] = { block, total: 0, occupied: 0 };
            }

            blockMap[block].total += room.capacity;
            blockMap[block].occupied += room.occupiedBeds;
        });

        const occupancyData = Object.values(blockMap);

        // ================= RECENT ACTIVITY =================
        const complaints = await Complaint.findAll({
            order: [["createdAt", "DESC"]],
            limit: 5,
        });

        const recentActions = complaints.map((c) => ({
            action: `Complaint: ${c.title || "New complaint"}`,
            by: "Student",
            time: new Date(c.createdAt).toLocaleString(),
            icon: "🛠️",
        }));

        // ================= FINAL RESPONSE =================
        res.json({
            stats: {
                totalStudents,
                totalRooms,
                occupiedBeds,
                occupancyRate,
                totalWardens,
            },
            cgpaData,
            occupancyData,
            recentActions,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




exports.uploadCgpaCsv = async (req, res) => {
    try {
        const results = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", async () => {

                for (const row of results) {
                    const student = await Student.findOne({
                        where: { PRN: row.PRN }
                    });

                    if (student) {
                        student.CGPA = parseFloat(row.CGPA);
                        student.branch = row.Branch;
                        student.year = parseInt(row.Year);
                        await student.save();
                    }
                }

                res.json({ message: "CSV uploaded successfully" });
            });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ================= ROOM ALLOCATION =================

exports.allocateRoom = async (req, res) => {
    try {

        const { studentId, roomId, cycleId } = req.body;

        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const room = await Room.findByPk(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.AllocationCycleId != cycleId) {
            return res.status(400).json({ message: "Invalid cycle room" });
        }

        // REMOVE FROM OLD ROOM
        if (student.RoomId) {
            const oldRoom = await Room.findByPk(student.RoomId);

            if (oldRoom) {
                const oldCount = await Student.count({
                    where: { RoomId: oldRoom.id }
                });

                oldRoom.occupiedBeds = Math.max(0, oldCount - 1);

                oldRoom.status =
                    oldRoom.occupiedBeds < oldRoom.capacity
                        ? "available"
                        : "full";

                await oldRoom.save();
            }
        }

        // CHECK CAPACITY
        const currentCount = await Student.count({
            where: { RoomId: room.id }
        });

        if (currentCount >= room.capacity) {
            return res.status(400).json({ message: "Room is full" });
        }

        // ASSIGN
        student.RoomId = room.id;
        await student.save();

        // SYNC ROOM
        const updatedCount = await Student.count({
            where: { RoomId: room.id }
        });

        room.occupiedBeds = updatedCount;

        room.status =
            updatedCount >= room.capacity ? "full" : "available";

        await room.save();

        res.json({ message: "Room allocated successfully" });

    } catch (error) {
        console.error("ALLOCATE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};



// ================= REMOVE STUDENT FROM ROOM =================

exports.removeStudentFromRoom = async (req, res) => {
    try {

        const { studentId } = req.body;

        const student = await Student.findByPk(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!student.RoomId) {
            return res.status(400).json({ message: "No room assigned" });
        }

        const room = await Room.findByPk(student.RoomId);

        student.RoomId = null;
        await student.save();

        if (room) {
            const updatedCount = await Student.count({
                where: { RoomId: room.id }
            });

            room.occupiedBeds = updatedCount;

            room.status =
                updatedCount >= room.capacity ? "full" : "available";

            await room.save();
        }

        res.json({ message: "Student removed from room" });

    } catch (error) {
        console.error("REMOVE ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};