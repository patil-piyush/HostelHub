const { Warden, Complaint, Leave, Student, Movement } = require('../models');
/* =====================================================
                    PROFILE
===================================================== */

exports.getProfile = async (req, res) => {
    try {
        const warden = await Warden.findByPk(req.user.id, {
            attributes: { exclude: ["password"] }
        });

        if (!warden) {
            return res.status(404).json({ message: "Warden not found" });
        }

        res.json(warden);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const warden = await Warden.findByPk(req.user.id);

        if (!warden) {
            return res.status(404).json({ message: "Warden not found" });
        }

        const { password, ...data } = req.body;
        await warden.update(data);

        res.json({
            message: "Profile updated successfully",
            warden
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* =====================================================
                    DASHBOARD (NEW)
===================================================== */

exports.getDashboardStats = async (req, res) => {
    try {

        const complaints = await Complaint.findAll();
        const leaves = await Leave.findAll();

        res.json({
            totalComplaints: complaints.length,
            openComplaints: complaints.filter(c => c.status === "Open").length,
            inProgressComplaints: complaints.filter(c => c.status === "In Progress").length,
            resolvedComplaints: complaints.filter(c => c.status === "Resolved").length,

            totalLeaves: leaves.length,
            pendingLeaves: leaves.filter(l => l.status === "Pending").length,
            approvedLeaves: leaves.filter(l => l.status === "Approved").length,
            rejectedLeaves: leaves.filter(l => l.status === "Rejected").length
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* =====================================================
                    COMPLAINTS
===================================================== */

exports.getAllComplaints = async (req, res) => {
    try {

        const { status } = req.query;

        const where = {};
        if (status) where.status = status;

        const complaints = await Complaint.findAll({
            where,
            include: [{
                model: Student,
                attributes: ["id", "name", "PRN", "email"]
            }],
            order: [["createdAt", "DESC"]]
        });

        res.json(complaints);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getComplaintById = async (req, res) => {
    try {

        const complaint = await Complaint.findByPk(req.params.id, {
            include: [{
                model: Student,
                attributes: ["id", "name", "PRN", "email"]
            }]
        });

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(complaint);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateComplaintStatus = async (req, res) => {
    try {

        const { status } = req.body;

        const allowedStatuses = ["Open", "In Progress", "Resolved"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const complaint = await Complaint.findByPk(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        complaint.status = status;
        complaint.resolvedAt = status === "Resolved" ? new Date() : null;

        await complaint.save();

        res.json({
            message: "Complaint updated successfully",
            complaint
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/* =====================================================
                        LEAVE
===================================================== */

exports.getAllLeaveApplications = async (req, res) => {
    try {

        const { status } = req.query;

        const where = {};
        if (status) where.status = status;

        const leaves = await Leave.findAll({
            where,
            include: [{
                model: Student,
                attributes: ["id", "name", "PRN", "email"]
            }],
            order: [["createdAt", "DESC"]]
        });

        res.json(leaves);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getLeaveApplicationById = async (req, res) => {
    try {

        const leave = await Leave.findByPk(req.params.id, {
            include: [{
                model: Student,
                attributes: ["id", "name", "PRN", "email"]
            }]
        });

        if (!leave) {
            return res.status(404).json({ message: "Leave not found" });
        }

        res.json(leave);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateLeaveApplicationStatus = async (req, res) => {
    try {

        const { status } = req.body;

        const allowedStatuses = ["Pending", "Approved", "Rejected"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid leave status" });
        }

        const leave = await Leave.findByPk(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: "Leave not found" });
        }

        leave.status = status;
        leave.decisionAt = new Date();
        leave.WardenId = req.user.id; // FIXED

        await leave.save();

        res.json({
            message: "Leave status updated successfully",
            leave
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* =====================================================
                STUDENT MOVEMENT (NEW)
===================================================== */



exports.getStudentMovement = async (req, res) => {
    try {

        const movements = await Movement.findAll({
            include: [{
                model: Student,
                attributes: ["id", "name", "PRN"]
            }],
            order: [["createdAt", "DESC"]]
        });

        res.json(movements);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};