const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productMarketController = require('../controllers/productMarketController');
const checkAuth = require('../middleware/check-auth');

router.use(checkAuth);
router.get('/data?:pid?:sid', productMarketController.getPrices);
/*router.get('/add', productController.getAddForm);
router.get('/update/:id', productController.getUpdate);
router.get('/prices/:id', productController.getPrices);

router.post('/prices/:id', productController.FilterMarketPrices);
router.post('/delete/:id', productController.deleteProduct);
router.post('/', productController.find);

router.post(
    '/add', 
    [
        check('productName')
        .not()
        .isEmpty(),

        check('productTitle')
        .not()
        .isEmpty(),

        check('productBrand')
        .not()
        .isEmpty(),

        check('productCategory')
        .not()
        .isEmpty()
    ],
    productController.addProduct);
router.post(
    '/update/:id',
    [
        check('productName')
        .not()
        .isEmpty(),

        check('productTitle')
        .not()
        .isEmpty(),

        check('productBrand')
        .not()
        .isEmpty(),

        check('productCategory')
        .not()
        .isEmpty()
    ],
     productController.updateProduct);*/


module.exports = router;