const { Student, Warden } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');


// Register Student
exports.userRegister = async (req, res) => {
    try {

        const { name, email, password, PRN } = req.body;

        // Validate input
        if (!name || !email || !password || !PRN) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check existing user by checking if email or PRN exist
        const existingUser = await Student.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { PRN }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await Student.create({
            name,
            email,
            PRN,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Student Login
exports.userLogin = async (req, res) => {
    try {

        const { email, password, PRN } = req.body;

        if ((!email && !PRN) || !password) {
            return res.status(400).json({ message: 'Email or PRN and password are required' });
        }

        // Find user
        const user = await Student.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { PRN }
                ]
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const userToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send cookie
        res.cookie('userToken', userToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        }).status(200).json({ message: 'Login successful' });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server error', error: error.message });
    }
};


// Student Logout
exports.userLogout = (req, res) => {

    try {

        res.clearCookie('userToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }).status(200).json({ message: 'Logout successful' });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }

};


// Warden Login
exports.wardenLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const warden = await Warden.findOne({
            where: { email }
        });

        if (!warden) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, warden.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const wardenToken = jwt.sign(
            { id: warden.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('wardenToken', wardenToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        }).status(200).json({ message: 'Login successful' });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }

};


// Warden Logout
exports.wardenLogout = (req, res) => {

    try {

        res.clearCookie('wardenToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }).status(200).json({ message: 'Logout successful' });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }

};


// Admin Login
exports.adminLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const adminToken = jwt.sign(
            { role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('adminToken', adminToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        }).status(200).json({ message: 'Admin login successful' });

    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }

};


// Admin Logout
exports.adminLogout = (req, res) => {

    try {

        res.clearCookie('adminToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }).status(200).json({ message: 'Admin logout successful' });

    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }

};