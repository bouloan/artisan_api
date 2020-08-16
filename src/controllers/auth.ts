import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { IRefreshToken } from '../database/models/refreshToken';
import { sendError } from '../middlewares/errors';
import EmailService from '../services/email.service';
import TokenService, { ITokens } from '../services/token.service';
import UserService, { IToValidateUser } from '../services/user.service';
import { throwValidationErrorIfExist } from '../services/validation.service';
import { IUser } from './../database/models/user';

export interface Ilogin {
	email: string;
	password: string;
}

export default class AuthController {
	emailService: EmailService = new EmailService();
	userService: UserService = new UserService();
	tokenService: TokenService = new TokenService();

	signup: RequestHandler = async (req, res, next) => {
		try {
			const errors = validationResult(req);
			throwValidationErrorIfExist(errors);

			const requestUser: IUser = req.body;

			const user = (await this.userService.signup(requestUser)) as IUser;

			return res.status(201).json({
				message:
					'Vous avez bien été enregistré. Veuillez finaliser votre inscription en vous rendant sur votre boite mail',
				user: { id: user._id, email: user.email },
			});
		} catch (err) {
			sendError(err, next);
		}
	};

	accountValidation: RequestHandler = async (req, res, next) => {
		/* la requête doit comprendre email et validation token */
		const requestUser: Partial<IUser> = req.body;
		try {
			const user = await this.userService.accountValidation(requestUser);

			res.status(201).json({
				message: 'Votre compte a été validé, vous pouvez vous connecter',
				userId: user._id,
			});
		} catch (err) {
			sendError(err, next);
		}
	};

	accountValidationTokenCreation: RequestHandler = async (req, res, next) => {
		const email: string = req.body;
		try {
			const user = await this.userService.accountValidationTokenCreation(email);

			res.status(201).json({
				message:
					'Un code vous a été envoyé par email pour finaliser votre inscription',
				user: user,
			});
		} catch (err) {}
	};

	login: RequestHandler = async (req, res, next) => {
		try {
			const loginUser: Ilogin = req.body;

			const data = await this.userService.login(loginUser);
			//if user is active, he can be connected to all routes so tokens are returned
			if (data.isActiveUser === true) {
				const tokens = data as ITokens;
				res.status(200).json({
					token: tokens.token,
					refreshToken: tokens.refreshToken,
					userId: tokens.userId,
					isActiveUser: tokens.isActiveUser,
				});
			}
			//else email is return to validate token
			else {
				const toValidateUser = data as IToValidateUser;
				res.status(200).json({
					message: toValidateUser.message,
					email: toValidateUser.email,
					isActiveUser: toValidateUser.isActiveUser,
				});
			}
		} catch (err) {
			sendError(err, next);
		}
	};

	logout: RequestHandler = async (req, res, next) => {
		const userId: string = req.query.userId;
		try {
			await this.tokenService.removeRefreshTokensFromDb(userId);
			res.status(200).json({
				message: "L'utilisateur est déconnecté",
			});
		} catch (err) {
			sendError(err, next);
		}
	};

	token: RequestHandler = async (req, res, next) => {
		try {
			let request: IRefreshToken = req.body;
			const newToken = await this.tokenService.renewToken(request);

			res.status(200).json({
				token: `Bearer: ${newToken}`,
				refreshToken: `Bearer: ${request.refreshToken}`,
				userId: request.userId,
			});
		} catch (err) {
			sendError(err, next);
		}
	};

	passwordRecovery: RequestHandler = async (req, res, next) => {
		try {
			const email: string = req.body.email;
			const passwordRecovery = await this.userService.passwordRecovery(email);
			if (passwordRecovery) {
				res.status(200).json({
					message:
						"Si vous votre email a été enregistré dans l'application Commis, un mot de passe temporaire vous a été envoyé",
				});
			}
		} catch (err) {
			sendError(err, next);
		}
	};
}
