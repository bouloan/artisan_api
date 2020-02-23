import { Router } from 'express';
import { body } from 'express-validator';
import { login, signup } from '../controllers/auth';
import user from '../models/user';

const router = Router();

const bodyValidator = [
	body('name', 'Le nom doit être compris entre 2 et 50 caractères')
		.notEmpty()
		.isLength({ min: 2, max: 50 })
		.trim(),
	body('firstName', 'Le prénom doit être compris entre 2 et 50 caractères')
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
				if (userDoc) return Promise.reject("L'email existe déjà");
			});
		})
		.normalizeEmail()
		.trim(),
	body(
		'password',
		'Le mot de passe doit comporter au minimum 8 caractères dont un chiffre, un caractère en minuscule et un caractère en majuscule'
	)
		.notEmpty()
		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
		.trim() /**supprimer les espaces avant et après */
];

router.put('/signup', bodyValidator, signup);

router.post('/login', login);

export default router;
