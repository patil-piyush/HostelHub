const jwt = require('jsonwebtoken');

exports.verifyAdmin = (req, res, next) => {
    try {

        // check cookie exists
        if (!req.cookies || !req.cookies.adminToken) {
            return res.status(401).json({ message: 'Admin authentication required' });
        }

        const token = req.cookies.adminToken;

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // check role
        if (!decoded || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // attach admin data to request
        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: 'Invalid or expired admin token'
        });

    }
};