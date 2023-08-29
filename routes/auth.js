const express = require('express');
const {check,body} = require('express-validator');
const User = require('../models/user');
const router = express.Router();
const authController = require('../controllers/auth');
router.post('/signup',[
    body('email')
    .isEmail()
    .withMessage("Please enter valid email")
    .custom((value,{req}) => {
        return User.findOne({email:value}).then(userDoc => {
            if(userDoc) {
                return Promise.reject("Email already exists")
            }
        })
    })
    .normalizeEmail(),
    body('password').trim().isLength({min :5}),
],authController.singup);

router.post('/login',authController.login);

module.exports = router;