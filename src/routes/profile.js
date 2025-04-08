const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { isGettingData, isUpdateAllowed } = require('../utils/helper');
const User = require('../models/user');

const profileRouter = express.Router({ caseSensitive: true });

profileRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

profileRouter.patch("/profile/:userId", userAuth, async (req, res) => {
    try {
        const id = req.params?.userId;
        const data = req.body;

        isGettingData(req);
        isUpdateAllowed(req);

        const updatedUser = await User.findByIdAndUpdate(id, data, { runValidators: true, returnDocument: 'after' });
        res.status(200).json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

module.exports = profileRouter;