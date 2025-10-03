const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');

    // If no header or it's not a Bearer token, just proceed without a user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return next();
    }

    try {
        // If token is valid, attach user to the request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        // If token is invalid (e.g., expired), just ignore it and proceed without a user
        console.log("Optional auth: Invalid token provided, proceeding without user.");
    }
    
    next();
};