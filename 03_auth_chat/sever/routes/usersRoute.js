const express = require('express');
const router = express.Router()

const { getUsers } = require('../controllers/users')

router.post('/users', getUsers);

module.exports = router
