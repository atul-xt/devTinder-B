const User = require("../models/user");


const isEmailAlreadyRegistered = async (req) => {
    const { emailId } = req.body;

    const userExist = await User.findOne({ emailId });

    if (userExist) {
        throw new Error("User already registered");
    }
}

const isUpdateAllowed = (req) => {
    const data = req.body;

    const UPDATE_ALLOWED = ["age", "gender", "profileUrl", "about", "skills"]
    const isUpdateAllowed = Object.keys(data).every((k) => UPDATE_ALLOWED.includes(k));

    if (!isUpdateAllowed) {
        throw new Error("Update not allowed (firstName, lastName, email & password) could not be changed")
    }
    if (data?.skills?.length > 10) {
        throw new Error("Skills cannot be more than 10")
    }
}

const isGettingData = (req) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        throw new Error("Data not found");
    }
}

module.exports = {
    isEmailAlreadyRegistered,
    isGettingData,
    isUpdateAllowed
}