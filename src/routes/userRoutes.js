const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { searchUsers, getUserProfile } = require('../controllers/userController');

// All routes require authentication
router.use(auth);

router.get('/search', searchUsers);
router.get('/profile/:userId', getUserProfile);

module.exports = router;