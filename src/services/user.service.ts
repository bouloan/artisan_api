import bcryptjs from 'bcryptjs';
import { Ilogin } from '../controllers/auth';
import User, { IUser } from '../database/models/user';
import { throwError } from '../middlewares/errors';
import { UserRepo } from './../database/repository/user-repo';
import EmailService from './email.service';
import TokenService, { ITokens } from './token.service';
const crypt = require('crypto-random-string');

export interface IToValidateUser {
	message: string;
	isActiveUser: boolean;
	email: string;
}

export default class UserService {
	emailService: EmailService = new EmailService();
	tokenService: TokenService = new TokenService();
	userRepo: UserRepo = new UserRepo();

	async signup(user: IUser) {
		try {
			const dbUser = new User(user);
			dbUser.password = await this.hashPassword(user.password);

			return this.accountValidationTokenCreation(dbUser.email, dbUser);
		} catch (err) {}
	}

	async hashPassword(password: string) {
		return await bcryptjs.hash(password, 12);
	}

	async setToken(length: number): Promise<string> {
		return crypt({
			length: length,
			type: 'base64',
		});
	}

	//create a token and both send it to the user via email and save it in the database
	async accountValidationTokenCreation(
		email: string,
		u?: IUser
	): Promise<IUser> {
		try {
			const accountValidationToken: string = await this.setToken(8);
			//if the u parameter does not existe, the user is found in the db
			const user = u ? u : await this.userRepo.findByEmail(email);

			user.accountValidationToken = (await this._createCryptedToken(
				accountValidationToken
			)) as string;
			const userWithToken = await user.save();
			this.emailService.sendAccountValidationEmail(
				email,
				accountValidationToken
			);
			return userWithToken;
		} catch (e) {
			return throwError(500, "L'utilisateur n'a pu être créé");
		}
	}

	async login(user: Ilogin): Promise<ITokens | IToValidateUser> {
		try {
			const dbUser = await this.userRepo.findByEmail(user.email!);
			if (dbUser === null) {
				return throwError(401, 'Les identifiants ne sont pas valides');
			}
			const passwordsAreEqual = await bcryptjs.compare(
				user.password as string,
				dbUser.password
			);
			//si les identifiants connexion ne sont pas bons
			if (!passwordsAreEqual) {
				return throwError(401, 'Les identifiants ne sont pas valides');
			}
			if (dbUser.isActive === false) {
				await this.accountValidationTokenCreation(dbUser.email);
				const data: IToValidateUser = {
					message:
						"Votre compte n'ayant pas été validé, un code vous a été envoyé par email pour finaliser votre inscription",
					isActiveUser: false,
					email: dbUser.email,
				};
				return data;
			}
			//si les identifiants de connexions sont ok, un token est attribué
			return await this.tokenService.addTokens(dbUser);
		} catch (err) {
			return throwError(err.statusCode, err.message);
		}
	}

	async accountValidation(user: Partial<IUser>): Promise<IUser> {
		try {
			const dbUser = await this.userRepo.findByEmail(user.email!);
			if (dbUser.isActive) {
				return throwError(403, 'Les identifiants ont déjà été validés');
			}
			const accountIsValid = await bcryptjs.compare(
				user.accountValidationToken as string,
				dbUser.accountValidationToken
			);
			if (!accountIsValid) {
				return throwError(401, 'Les identifiants ne sont pas valides');
			}
			dbUser.isActive = true;
			user.accountValidationToken = '';
			await dbUser.save();
			return dbUser;
		} catch (err) {
			return throwError(err.statusCode, err.message);
		}
	}

	private _createCryptedToken = async (
		accountValidationToken: string
	): Promise<string | undefined> => {
		const hashedAccountValidationToken = await bcryptjs.hash(
			accountValidationToken,
			12
		);
		return hashedAccountValidationToken;
	};

	async passwordRecovery(email: string) {
		try {
			const dbUser = await this.userRepo.findByEmail(email!);
			const temporaryPassword: string = await this.setToken(8);
			if (dbUser) {
				dbUser.password = (await this._createCryptedToken(
					temporaryPassword
				)) as string;
				await dbUser.save();
				this.emailService.sendTemporaryPassword(email, temporaryPassword);
				return true;
			} else {
				return true;
			}
		} catch (err) {
			return throwError(500, "Le mot de passe n'a pu être réinitialisé");
		}
	}
}
