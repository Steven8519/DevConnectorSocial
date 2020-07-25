const express = require('express');
const router = express.Router();

// @route     Get api/auth
// @desc      Test route
// @access    Public
router.get('/', (request, response) => {
    response.send(' Auth route');
});

module.exports = router;