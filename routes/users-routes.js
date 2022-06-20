const express = require('express')
const router = express.Router();
const { check } = require('express-validator');
const usersController = require('../controllers/usersController');

router.get('/', usersController.getUsers);
router.post('/signup',
[
    check('Email')
        .normalizeEmail()// Test@test.com => test@test.com
        .isEmail(),
    check('password').isLength({ min:6 })

],
 usersController.signup);
router.post('/login', usersController.login);


module.exports = router;