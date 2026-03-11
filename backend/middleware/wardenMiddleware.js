const jwt = require('jsonwebtoken');
const { Warden } = require('../models');

exports.verifyWarden = async (req, res, next) => {

    try {

        // check cookie
        if (!req.cookies || !req.cookies.wardenToken) {
            return res.status(401).json({
                message: "Access denied. Warden login required."
            });
        }

        const token = req.cookies.wardenToken;

        // verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find warden
        const warden = await Warden.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!warden) {
            return res.status(403).json({
                message: "Access denied. Warden only."
            });
        }

        // attach warden to request
        req.warden = warden;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

};