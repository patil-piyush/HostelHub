const jwt = require('jsonwebtoken');

exports.verifyAdmin = (req, res, next) => {
    try {

        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        else if (req.cookies && req.cookies.adminToken) {
            token = req.cookies.adminToken;
        }

        if (!token) {
            return res.status(401).json({ message: 'Admin authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        req.admin = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired admin token'
        });
    }
};