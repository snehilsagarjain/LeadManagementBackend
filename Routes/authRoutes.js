const express = require('express');
const router = express.Router();
const { userLogin, verifyTokenAPI } = require('../Controller/authController')
router.post('/login', userLogin);
router.get("/verifyToken", verifyTokenAPI); // Ensure this exists!
module.exports = router;