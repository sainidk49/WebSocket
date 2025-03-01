const User = require('../models/userModel');

const getUsers = async (req, res) => {
    try {
        const users = await User.find({},{_id: 1, name: 1, email: 1, isVerified: 1});
        if(users.length===0){
            return res.status(404).json({ status: false, message: "Users not found."})
        }
        return res.status(200).json({ status: true, message: "Successfull.", users: users })
    } catch (error) {
        console.log("Error :: ", error)
        return res.status(200).json({ status: false, message: error.message })
    }
}

module.exports = { getUsers }