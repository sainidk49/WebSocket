const User = require('../models/userModel');
const { upload, deleteOldImage, saveImageFromUrl } = require('../multer/uploadConfig.js');

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
    const { userId } = req.params;
    const { destination, filename } = req.file;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found." });
        }

        let deleteProfile = false
        console.log(user.profile)
        if (user.profile) {
            deleteProfile = await deleteOldImage(user.profile);

            if (!deleteProfile) {
                return res.status(500).json({ status: false, message: "Failed to delete old profile image." });
            }
        }


        const userProfile = `http://192.168.0.107:5500/${destination}/${filename}`
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: { profile: userProfile, updatedAt: new Date() } }, { new: true })

        // user.profile = profile;
        // await user.save();

        return res.status(200).json({ status: true, message: "Successfull.", user: updatedUser })

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

const updateDetails = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found." });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { $set: req.body, updatedAt: new Date() }, { new: true})

        return res.status(200).json({ status: true, message: "Successfull.", user: updatedUser })

    } catch (error) {
        console.log("Error :: ", error)
        return res.status(200).json({ status: false, message: error.message })
    }
}

module.exports = { getUsers, updateProfile, getProfile, updateDetails }