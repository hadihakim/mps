const express = require('express');
const router = express.Router();
const { check, oneOf } = require('express-validator');
const signupController = require('../controllers/signupController');

router.get('/', signupController.getSignupForm);

router.post('/add', [
    check('Name')
    .not()
    .isEmpty(),

    check('Email')
    .not()
    .isEmpty(),

    check('Password')
    .not()
    .isEmpty(),

    check('Role')
    .not()
    .isEmpty()

], 
signupController.register);

module.exports = router;