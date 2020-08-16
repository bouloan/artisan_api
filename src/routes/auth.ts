import { Router } from 'express';
import AuthController from '../controllers/auth';
import { loginValidators, signupValidators } from '../middlewares/validators';

const authController = new AuthController();

const router = Router();

router.post('/signup', signupValidators, authController.signup);

router.post('/accountvalidation', authController.accountValidation);

router.post(
	'accountvalidation-token-creation',
	authController.accountValidationTokenCreation
);

router.post('/login', loginValidators, authController.login);

router.post('/token', authController.token);

router.post('/password-recovery', authController.passwordRecovery);

router.get('/logout', authController.logout);

export default router;
