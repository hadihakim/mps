const express = require('express')
const router = express.Router();
const { check } = require('express-validator');
const countryController = require('../controllers/countriesController');


router.get('/', countryController.getCountries);
router.get('/:id', countryController.getCountry );
router.delete('/:id', countryController.deleteCountry);
router.post(
    '/', 
    [
        check('countryName')
        .not()
        .isEmpty()
    ],
    countryController.addCountry);
router.patch(
    '/:id',
    [
        check('countryName')
        .not()
        .isEmpty()
    ],
     countryController.updateCountry);


module.exports = router;