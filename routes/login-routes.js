const express = require('express');
const router = express.Router();
const { check, oneOf } = require('express-validator');
const loginController = require('../controllers/loginController');

router.get('/', loginController.getLoginForm);

router.post('/', [
    check('Email')
    .not()
    .isEmpty(),

    check('Password')
    .not()
    .isEmpty()
], 
loginController.login);

module.exports = router;