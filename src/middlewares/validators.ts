import { body } from 'express-validator';
import user from '../database/models/user';

export const signupValidators = [
	body('firstName', 'Le prénom doit être compris entre 2 et 50 caractères')
		.notEmpty()
		.isLength({ min: 2, max: 50 })
		.trim(),
	body('name', 'Le nom doit être compris entre 2 et 50 caractères')
		.notEmpty()
		.isLength({ min: 2, max: 50 })
		.trim(),
	body('email')
		.notEmpty()
		.isLength({ min: 5, max: 255 })
		.withMessage("L'email doit être compris entre 5 et 255 caractères")
		.matches(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/)
		.withMessage('Veuillez renseigner un email valide')
		.custom((value, { req }) => {
			return user.findOne({ email: value }).then((userDoc) => {
				if (userDoc)
					return Promise.reject(
						'Un utilisateur utilisant cet email a déjà été enregistré'
					);
			});
		})
		.trim(),
	body(
		'password',
		'Le mot de passe doit comporter au minimum 8 caractères dont un chiffre, un caractère en minuscule et un caractère en majuscule'
	)
		.notEmpty()
		.matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[A-Za-zd].{8,}/)
		.trim() /**supprimer les espaces avant et après */,
];

export const stockValidators = [
	body('designation')
		.notEmpty()
		.withMessage("L'intitulé doit être renseigné")
		.isLength({ min: 2, max: 50 })
		.withMessage("L'intitulé doit comprendre entre 2 et 50 caractères")
		.trim(),
	body('brand')
		.notEmpty()
		.withMessage('La marque doit être renseigné')
		.isLength({ min: 2, max: 50 })
		.withMessage('La marque doit comprendre entre 2 et 50 caractères')
		.trim(),
	body('image').trim(),
	body('reference', 'La référence doit comprendre au maximum 50 caractères')
		.isLength({ max: 50 })
		.trim(),
	body(
		'supplier',
		'Le nom du fournisseur doit comprendre au maximum 50 caractères'
	)
		.isLength({ max: 50 })
		.trim(),
	body('supplierWebsite')
		.if(body('supplierWebsite').exists({ checkFalsy: true }))
		.isURL()
		.withMessage("L'adresse web du fournisseur doit être une url valide")
		.trim(),
	body('quantity', 'La quantité doit être un nombre positif')
		.notEmpty()
		.isInt({ min: 0 })
		.trim(),
	body('minQuantity', 'La quantité minimale doit être un nombre positif')
		.notEmpty()
		.isInt({ min: 0 })
		.trim(),
];

export const loginValidators = [body('email').notEmpty()];
