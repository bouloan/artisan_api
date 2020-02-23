import { Router } from 'express';
import { body } from 'express-validator';
import { addItem, deleteItem, getItem, getItems, updateItem } from '../controllers/stock';
import { verifyJWT } from '../middlewares/is-auth';

const router = Router();

const bodyValidator = [
	body('name', "L'intitulé doit être compris entre 2 et 50 caractères")
		.notEmpty()
		.isLength({ min: 2, max: 50 })
		.trim(),
	body('brand', 'La marque doit être comprise entre 2 et 50 caractères')
		.notEmpty()
		.isLength({ min: 2, max: 50 })
		.trim(),
	//	body('imageUrl').isURL(),
	body('reference', 'La référence doit être comprise entre 2 et 50 caractères')
		.trim()
		.isLength({ min: 2, max: 50 }),
	body('supplier', 'La référence doit être comprise entre 2 et 50 caractères')
		.isLength({ min: 2, max: 50 })
		.trim(),
	body('supplierWebsite')
		.isURL()
		.withMessage("L'adresse web du fournisseur doit être une url valide")
		.trim(),
	body('quantity', 'La quantité doit être un nombre positif').notEmpty().isInt({ min: 0 }).trim(),
	body('minQuantity', 'La quantité minimale doit être un nombre positif')
		.notEmpty()
		.isInt({ min: 0 })
		.trim()
];

// POST /stock/add-item
router.post('/add-item', verifyJWT, bodyValidator, addItem);

//PUT /stock/update-item
router.put('/update-item/:itemId', verifyJWT, bodyValidator, updateItem);

//DELETE /stock/delete-item
router.delete('/item/:itemId', verifyJWT, deleteItem);

// GET /stock/items
router.get('/items', verifyJWT, getItems);
router.patch('/');

//GET /stock/item/:itemId
router.get('/item/:itemId', verifyJWT, getItem);

export default router;
