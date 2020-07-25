const express = require('express');
const router = express.Router();

// @route     Get api/posts
// @desc      
// @access    Public
router.post('/', (request, response) => {
    
    response.send('Post route');
});

module.exports = router;