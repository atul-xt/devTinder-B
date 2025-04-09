const express = require('express');
const { isEmailAlreadyRegistered, isGettingData } = require('../utils/helper');
const { signupValidation, loginValidation } = require('../utils/validation');
const User = require('../models/user');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, emailId, password, age, gender } = req.body;

        await isEmailAlreadyRegistered(req);
        isGettingData(req);
        // signupValidation(req);

        const user = await User();
        const bcryptPass = await user.getBcryptPassword(password);

        const newUser = new User({ firstName, lastName, emailId, password: bcryptPass, age, gender});
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        isGettingData(req);

        loginValidation(req);

        const user = await User.findOne({ emailId });

        if (!user) {
            throw new Error("User not registered");
        }

        const isPasswordValid = await user.checkBcryptPassword(password);

        if (isPasswordValid) {
            const token = await user.getJWT();
            res.cookie("token", token, { expires: new Date(Date.now() + 24 * 3600000) });
            return res.status(200).json({ message: "Logged in successfully" });
        } else {
            throw new Error("Wrong password please check");
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

authRouter.post('/logout', async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });

    res.status(200).json({ message: "Logged out successfully" });
})

module.exports = authRouter;