const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../Models/UserModel');

const isAuthenticated = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            //get token from header
            token = req.headers.authorization.split(' ')[1];
            
            //verify token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
           
            //get user from tokenp
            const user = await User.findById(decoded.userId);

                  
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check user's role
            // const allowedRoles = ['admin', 'user'];
            // if (!user.role || !allowedRoles.includes(user.role)) {
            //     return res.status(403).json({ message: 'Forbidden' });
            // }
            

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
});

module.exports = { isAuthenticated };

