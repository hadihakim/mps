const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productController = require('../controllers/productsController');
const checkAuth = require('../middleware/check-auth');

router.use(checkAuth);
router.get('/', productController.getProducts);
router.get('/add', productController.getAddForm);
router.get('/update/:id', productController.getUpdate);
router.get('/prices/:id', productController.getPrices);


/*router.post('/prices/:id', productController.FilterMarketPrices);*/
router.delete('/delete/:id', productController.deleteProduct);
router.delete('/prices/delete/:id/:marketId/:productId', productController.deleteProductMarketPrice);


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
        '/prices/add', 
        [
            check('SupermarketAddressId')
            .not()
            .isEmpty(),
    
            check('ProductId')
            .not()
            .isEmpty(),
    
            check('price')
            .not()
            .isEmpty()
        ],
        productController.addPriceMarketProduct);


router.put(
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
     productController.updateProduct);


module.exports = router;