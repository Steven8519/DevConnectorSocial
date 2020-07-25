const express = require('express');
const router = express.Router();

// @route     Get api/users
// @desc      Test route
// @access    Public
router.get('/', (request, response) => {
    response.send(' user route');
});

module.exports = router;