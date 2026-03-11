const jwt = require('jsonwebtoken');
const { Student } = require('../models');

exports.verifyUser = async (req, res, next) => {

    try {

        // check cookie exists
        if (!req.cookies || !req.cookies.userToken) {
            return res.status(401).json({
                message: "Access denied. Login required."
            });
        }

        const token = req.cookies.userToken;

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find student
        const user = await Student.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        // attach user to request
        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }
};