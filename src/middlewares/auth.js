const jwt = require('jsonwebtoken');
const User = require('../models/user');


const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Please try to again login");
        }

        const { _id } = await jwt.verify(token, "DEV@TINDER$2885");
        const user = await User.findById(_id);

        if (!user) {
            throw new Error("User not exist");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    userAuth
}
