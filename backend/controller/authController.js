const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate user input
        if(!name || !email || !password) {
            return res.status(400).json({message: 'All fields are required'});
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// login a user
exports.login = async(req, res) => {
    try {
        
        // get user inputs
        const {email, password, PRN} = req.body;

        // validate user inputs - either email or PRN should be provided and password is compulsory required
        if((!email && !PRN) || !password) {
            return res.status(400).json({message: 'Email or PRN and password are required'});
        }

        // find user by email or PRN
        const user = await User.findOne({ $or: [{ email }, { PRN }] });

        if(!user) {
            return res.status(400).json({message: 'Invalid credentials'});
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({message: 'Invalid credentials'});
        }

        // create JWT token
        const userToken = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '24h'});

        // pass token through cookie
        res.cookie('userToken', userToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // set secure flag in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }).status(200).json({ message: 'Login successful' });


    } catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }
}

// Logout a user
exports.logout = (req, res) => {
    try {
        res.clearCookie('userToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }).status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server error' });
    }
}