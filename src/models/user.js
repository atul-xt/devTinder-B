const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
    },
    age: {
        type: Number,
        min: 10,
        max: 99,
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Invalid gender provided.")
            }
        }
    },
    profileUrl: {
        type: String,
        default: "https://imgs.search.brave.com/2x3imi_133lqnirJKZE69J-WlAJ93mKjrrYoyzNw40g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMtY3NlLmNhbnZh/LmNvbS9ibG9iLzE5/NDA4MzAvMTYwMHct/cWdDbmQ1c3djclEu/anBn",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid photoUrl address");
            }
        }
    },
    about: {
        type: String,
        maxLength: 200,
    },
    skills: {
        type: [String],
        maxLength: 200,
    }

}, { timestamps: true })

userSchema.methods.getJWT = async function () {
    const token = await jwt.sign({ _id: this._id }, "DEV@TINDER$2885", { expiresIn: '1d' });
    return token;
}

userSchema.methods.getBcryptPassword = async function (password) {
    const bcryptPass = await bcrypt.hash(password, 10);
    return bcryptPass;
}

userSchema.methods.checkBcryptPassword = async function (password) {
    const isPasswordValid = await bcrypt.compare(password, this.password);
    return isPasswordValid
}

module.exports = mongoose.model("User", userSchema);