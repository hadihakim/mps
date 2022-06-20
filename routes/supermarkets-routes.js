const express = require('express');
const router = express.Router();
const { check, oneOf } = require('express-validator');
const supermarketController = require('../controllers/supermarketsController');


router.get('/', supermarketController.getMarkets);
router.get('/add', supermarketController.getAddForm);
//WORKING ON
router.get('/addProduct/:Id', supermarketController.getAddProductForm);
router.get('/addBranch', supermarketController.getAddBranchForm);
router.post('/', supermarketController.find);
router.get('/regions/:cid', supermarketController.getRegions);
//WORKING ON
router.get('/prices/:id', supermarketController.getPrices);
//WORKING ON
router.get('/data?:pid?:sid', supermarketController.getProductHistory);

router.post('/addCountry',[
            check('CountryName')
            .not()
            .isEmpty()
],supermarketController.addCountry);

router.post('/addRegion/:CountryId',[
        check('RegionName')
        .not()
        .isEmpty(),

        oneOf([
                check('CityName').not().isEmpty(), 
                check('selectCity').not().isEmpty(),
              ]),
        
],supermarketController.addRegion);

router.post('/add', [
            check('CountryId')
            .not()
            .isEmpty(),
    
            check('RegionId')
            .not()
            .isEmpty(),
    
            check('Street')
            .not()
            .isEmpty(),

            check('SupermarketName')
            .not()
            .isEmpty(),

            /*check('Description')
            .not()
            .isEmpty()*/
            
], 
supermarketController.addSupermarket);

router.post('/addProduct/:Id', [
        check('productId')
        .not()
        .isEmpty(),

        check('Price')
        .not()
        .isEmpty()
        
], 
supermarketController.insertProduct);

router.post('/addBranch', [
        check('RegionId')
        .not()
        .isEmpty(),

        check('Street')
        .not()
        .isEmpty(),

        check('SupermarketId')
        .not()
        .isEmpty() 
], 
supermarketController.addBranch);



module.exports = router;