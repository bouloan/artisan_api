import { Router } from 'express';
import StockController from '../controllers/stock';
import { verifyJWT } from '../middlewares/is-auth';
import { stockValidators } from '../middlewares/validators';

const stockController = new StockController();

const router = Router();

// POST /stock/add-item
router.post('/add-item', verifyJWT, stockValidators, stockController.addItem);

//PUT /stock/update-item
router.put(
	'/update-item/:itemId',
	verifyJWT,
	stockValidators,
	stockController.updateItem
);

//DELETE /stock/delete-item
router.delete('/item/:itemId', verifyJWT, stockController.deleteItem);

// GET /stock/items
router.get('/items', verifyJWT, stockController.getItems);
router.patch('/');

//GET /stock/item/:itemId
router.get('/item/:itemId', verifyJWT, stockController.getItem);

export default router;
