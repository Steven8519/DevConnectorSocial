const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');


// @route     Get api/users
// @desc      Register user
// @access    Public
router.post('/', [
    check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email', 'Please provide a valid email')
    .isEmail(),
    check('password', 'Please enter a password of 8 characters or more')
    .isLength({min: 8})
], 
async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = request.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return response.status(400).json({ errors:[{ message: 'Uer already exists'}] });
        }

        const avatar = gravatar.url(email, {
            size: '200',
            rating: 'pg',
            default: 'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        });

        const salt = await bycrypt.genSalt(10);

        user.password = await bycrypt.hash(password, salt);

        await user.save();

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