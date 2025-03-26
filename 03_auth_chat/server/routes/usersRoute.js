const express = require('express');
const router = express.Router()

const { getUsers, updateProfile, getProfile, updateDetails } = require('../controllers/usersController')
const { upload } = require('../multer/uploadConfig.js');
router.post('/users', getUsers);
router.post('/user/update/:userId', updateDetails);
router.post('/user/profile/:userId', getProfile);
router.post('/user/profile/update/:userId', upload.single("profile"), updateProfile);

module.exports = router
