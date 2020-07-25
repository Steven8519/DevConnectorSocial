const express = require('express');
const router = express.Router();

// @route     Get api/posts
// @desc      Test route
// @access    Public
router.get('/', (request, response) => {
    response.send('Post route');
});

module.exports = router;