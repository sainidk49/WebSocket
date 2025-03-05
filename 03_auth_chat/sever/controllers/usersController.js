const User = require('../models/userModel');
// import upload, { deleteOldImage, saveImageFromUrl } from '../multer/uploadConfig.js';

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, { _id: 1, name: 1, email: 1, profile: 1, isVerified: 1 });
        if (users.length === 0) {
            return res.status(404).json({ status: false, message: "Users not found." })
        }
        return res.status(200).json({ status: true, message: "Successfull.", users: users })
    } catch (error) {
        console.log("Error :: ", error)
        return res.status(200).json({ status: false, message: error.message })
    }
}

const updateProfile = async (req, res) => {
    const { userId, profile } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found." });
        }
        if (!profile) {
            return res.status(400).json({ status: false, message: "Profile is required." });
        }

        await User.findByIdAndUpdate(userId, { $set: { profile, updatedAt: new Date() } }, { new: true })

        // user.profile = profile;
        // await user.save();

        return res.status(200).json({ status: true, message: "Successfull." })

    } catch (error) {
        console.log("Error :: ", error)
        return res.status(200).json({ status: false, message: error.message })
    }
}

const getProfile = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId, { name: 1, email: 1, profile: 1, description: 1 });
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found." });
        }

        return res.status(200).json({ status: true, message: "Successfull.", user })

    } catch (error) {
        console.log("Error :: ", error)
        return res.status(200).json({ status: false, message: error.message })
    }
}

module.exports = { getUsers, updateProfile, getProfile }