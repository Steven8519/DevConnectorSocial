const express = require('express');
const router = express.Router();

// @route     Get api/profile
// @desc      Test route
// @access    Public
router.get('/', (request, response) => {
    response.send(' Profile route');
});

module.exports = router;