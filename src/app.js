const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { signupValidation, loginValidation } = require('./utils/validation');
const { isGettingData, isEmailAlreadyRegistered, isUpdateAllowed } = require('./utils/helper');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { userAuth } = require('./middlewares/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.patch("/user/:userId", userAuth, async (req, res) => {
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

app.delete('/user/:userId', userAuth, async (req, res) => {
    try {
        const id = req.params?.userId;

        const isAlreadyDeleted = await User.findById(id);
        if (!isAlreadyDeleted) {
            return res.status(400).json({ message: "User not found or already deleted" });
        }
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.get('/feed', userAuth, async (req, res) => {
    try {
        const feedData = await User.find({});
        if (feedData.length === 0) {
            return res.status(200).json({ message: "No users found", data: [] })
        }
        res.status(200).json({ data: feedData });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, emailId, password, age, gender } = req.body;

        await isEmailAlreadyRegistered(req);
        isGettingData(req);
        signupValidation(req);

        const bcryptPass = await bcrypt.hash(password, 10);

        const user = new User({ firstName, lastName, emailId, password: bcryptPass, age, gender });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        isGettingData(req);
        loginValidation(req);

        const user = await User.findOne({ emailId });

        if (!user) {
            throw new Error("User not registered");
        }

        const bcryptPass = await User.findOne({ emailId });
        const isPasswordValid = await bcrypt.compare(password, bcryptPass.password);

        if (isPasswordValid) {
            const token = await jwt.sign({ _id: user._id }, "DEV@TINDER$2885", { expiresIn: '1d' });
            res.cookie("token", token, { expires: new Date(Date.now() + 24 * 3600000) });
            return res.status(200).json({ message: "Logged in successfully" });
        } else {
            throw new Error("Wrong password please check");
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})


connectDB()
    .then(() => {
        console.log("DB successfully connected...");
        app.listen(3000, () => {
            console.log("Server is running on the PORT NUM: 3000");
        })
    })
    .catch((err) => {
        console.log("ERROR: ", err);
    })