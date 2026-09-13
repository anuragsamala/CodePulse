const express = require('express');
const router = express.Router();
const { getCommunityFeed } = require('../controllers/activityController');

router.get('/feed', getCommunityFeed);

module.exports = router;
