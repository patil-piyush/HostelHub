const { Student, Warden, Room } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const sequelize = require('../config/database');


// STUDENT REGISTER
exports.userRegister = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {

        const { name, email, password, PRN, roomNumber } = req.body;

        if (!name || !email || !password || !PRN || !roomNumber) {
            return res.status(400).json({
                message: 'All fields including roomNumber are required'
            });
        }

        const existingUser = await Student.findOne({
            where: {
                [Op.or]: [{ email }, { PRN }]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const room = await Room.findOne({
            where: { roomNumber },
            transaction
        });

        if (!room) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }

        if (room.occupiedBeds >= room.capacity) {
            return res.status(400).json({
                message: 'Room already full'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({

            name,
            email,
            PRN,
            password: hashedPassword,
            RoomId: room.id

        }, { transaction });

        room.occupiedBeds += 1;

        if (room.occupiedBeds === room.capacity) {
            room.status = "full";
        }

        await room.save({ transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'User registered successfully'
        });

    } catch (error) {

        await transaction.rollback();
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};



// =========================
// STUDENT LOGIN
// =========================

exports.userLogin = async (req, res) => {

    try {

        const { email, password, PRN } = req.body;
        console.log("REQ BODY:", req.body);

        if ((!email && !PRN) || !password) {
            return res.status(400).json({
                message: 'Email or PRN and password are required'
            });
        }

        const conditions = [];

        if (email) conditions.push({ email });
        if (PRN) conditions.push({ PRN });

        const user = await Student.findOne({
            where: {
                [Op.or]: conditions
            }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const userToken = jwt.sign(
            { id: user.id, role: "student" },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token: userToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: "student"
            }
        });

    } catch (error) {

        res.status(500).json({
            message: `Internal Server error${error.message ? ': ' + error.message : ''}`,
            error: error.message
        });

    }
};



// =========================
// STUDENT LOGOUT
// =========================

exports.userLogout = (req, res) => {

    try {

        res.clearCookie('userToken', {

            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'

        }).status(200).json({
            message: 'Logout successful'
        });

    } catch (error) {

        res.status(500).json({
            message: 'Internal Server error'
        });

    }
};



// =========================
// WARDEN LOGIN
// =========================

exports.wardenLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const warden = await Warden.findOne({
            where: { email }
        });

        if (!warden) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, warden.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const wardenToken = jwt.sign(

            { id: warden.id, role: "warden" },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }

        );

        res.status(200).json({
            message: 'Login successful',
            token: wardenToken,
            user: {
                id: warden.id,
                name: warden.name,
                email: warden.email,
                role: "warden"
            }
        });

    } catch (error) {

        res.status(500).json({
            message: 'Internal Server error'
        });

    }
};



// =========================
// WARDEN LOGOUT
// =========================

exports.wardenLogout = (req, res) => {

    try {

        res.clearCookie('wardenToken', {

            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'

        }).status(200).json({
            message: 'Logout successful'
        });

    } catch (error) {

        res.status(500).json({
            message: 'Internal Server error'
        });

    }
};



// =========================
// ADMIN LOGIN
// =========================

exports.adminLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password required'
            });
        }

        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: 'Invalid admin credentials'
            });
        }

        const adminToken = jwt.sign(

            { role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }

        );

        res.status(200).json({
            message: 'Admin login successful',
            token: adminToken,
            user: {
                id: "admin",
                name: "Admin",
                email: email,
                role: "admin"
            }
        });
    }
    catch (error) {

        res.status(500).json({
            message: 'Server error'
        });

    }
};



// =========================
// ADMIN LOGOUT
// =========================

exports.adminLogout = (req, res) => {

    try {

        res.clearCookie('adminToken', {

            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'

        }).status(200).json({
            message: 'Admin logout successful'
        });

    }
    catch (error) {

        res.status(500).json({
            message: 'Server error'
        });

    }

};