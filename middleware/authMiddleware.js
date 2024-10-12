const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;  // JWT is stored in cookies
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Please log in first.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);  // Verify and decode the token
        req.user = decoded;  // Store the decoded token data (user info) in req.user
        next();  // Move to the next middleware/controller
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token. Authentication failed.' });
    }
};

// Middleware to restrict access to admin-only routes
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();  // Move to the next middleware/controller
};

module.exports = {
    authenticateUser,
    authorizeAdmin
};
