const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get token from the standard Authorization header
    const authHeader = req.header('Authorization');

    // Check if Authorization header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // This handles cases where the token is missing or in an incorrect format
        return res.status(401).json({ message: 'No token, authorization denied (Expected "Authorization: Bearer <token>").' });
    }

    // 2. Extract the token (strip 'Bearer ')
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing after split.' });
    }

    // 3. Verify token
    try {
        // Ensure process.env.JWT_SECRET is accessible here!
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the full decoded payload (id, roles) to req.user
        req.user = decoded; 
        
        next(); // Authorization successful, proceed to the next handler
    } catch (err) {
        // Token is invalid (expired, wrong signature, etc.)
        console.error("JWT Verification Failed:", err.message);
        // CRITICAL FIX: Return the response here to terminate the request immediately
        return res.status(401).json({ message: 'Token is not valid or has expired.' });
    }
};
