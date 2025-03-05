const express = require('express');
const router = express.Router()

const { getUsers, updateProfile, getProfile } = require('../controllers/usersController')

router.post('/users', getUsers);
router.post('/user/profile/:userId', getProfile);
router.post('/user/updateProfile', updateProfile);

module.exports = router
