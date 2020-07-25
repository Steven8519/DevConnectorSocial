const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult } = require('express-validator');
const bycrypt = require('bcryptjs');

const User = require('../../models/User');

// @route     Get api/auth
// @desc      Test route
// @access    Public
router.get('/', auth, async (request, response) => {
    try {
        const user = await (await User.findById(request.user)).select('-password');
        response.json(user);
    } catch (error) {
        console.error(error.message)
        response.status(500).send('Server error');
    }
});

// @route     Get api/auth
// @desc      Authenticate an user and return a token.
// @access    Public
router.post('/', [
    check('email', 'email is incorrect')
    .isEmail(),
    check('password', 'is incorrect')
    .exists()
], 
async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() })
    }

    const { email, password } = request.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return response.status(400)
                            .json({ errors:[{ message: 'Invalid credentials'}] });
        }

        const isMatch = await bycrypt.compare(password, user.password);

        if (!isMatch) {
            return response.status(400)
                            .json({ errors:[{ message: 'Invalid credentials'}] });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 3600 },
            (error, token) => {
                if (error) throw error;
                response.json({ token })
            })

        response.send('User registered');
    } catch (error) {
        console.error(error.message);
        response.status(500).send('Server error');
    }
    
    
});

module.exports = router;