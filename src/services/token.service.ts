import { decode, sign } from 'jsonwebtoken';
import RefreshToken, { IRefreshToken } from '../database/models/refreshToken';
import User, { IUser } from '../database/models/user';
import {
	JWT_REFRESHTOKEN_SECRET_KEY,
	JWT_TOKEN_SECRET_KEY,
	TOKEN_EXPIRATION,
} from '../env';
import { throwError } from '../middlewares/errors';

export interface ITokens {
	token: string;
	refreshToken: string;
	userId?: string;
	isActiveUser?: boolean;
}

export interface ITokenData {
	email: string;
	userId: string;
	iat: Date;
	exp: Date;
}

export default class TokenService {
	generateToken = (user: IUser) => {
		return sign(
			{
				email: user.email,
				userId: user._id.toString(),
			},
			`${JWT_TOKEN_SECRET_KEY}`,
			{ expiresIn: TOKEN_EXPIRATION }
		);
	};

	decodeToken(token: string): ITokenData {
		return decode(token) as ITokenData;
	}

	generateRefreshToken = async (user: IUser): Promise<IRefreshToken> => {
		try {
			const refreshToken = sign(
				{
					email: user.email,
					userId: user._id.toString(),
				},
				`${JWT_REFRESHTOKEN_SECRET_KEY}`
			);

			const dbRefreshToken = await this.addRefreshTokenToDb(refreshToken, user);
			return dbRefreshToken;
		} catch (err) {
			return throwError(500, "Le refresh token n'a pas pu être généré");
		}
	};

	renewToken = async (request: IRefreshToken) => {
		try {
			if (!request.userId) {
				return throwError(401, "Aucun refreshToken n'est disponible");
			}
			request.refreshToken = request.refreshToken.split(' ')[1];
			const dbRefreshToken = await RefreshToken.findOne({
				userId: request.userId,
			});
			if (!dbRefreshToken) {
				return throwError(401, 'RefreshToken non valide');
			}
			const user = await User.findById(dbRefreshToken.userId);
			if (!user) {
				return throwError(401, 'RefreshToken non valide');
			}
			//si le refresh token est valide, on crée un token
			return this.generateToken(user);
		} catch (err) {
			return throwError(500, "Le refresh token n'a pas pu être généré");
		}
	};

	addRefreshTokenToDb = async (
		refreshToken: string,
		user: IUser
	): Promise<IRefreshToken> => {
		try {
			await this.removeRefreshTokensFromDb(user._id);
			const dbRefreshToken = new RefreshToken();
			dbRefreshToken.refreshToken = refreshToken;
			dbRefreshToken.userId = user._id;
			await dbRefreshToken.save();
			return dbRefreshToken;
		} catch (err) {
			return throwError(
				500,
				"Le refresh token n'a pas pu être sauvegardé en base"
			);
		}
	};

	addTokens = async (user: IUser): Promise<ITokens> => {
		try {
			const token = this.generateToken(user);
			const dbRefreshToken = await this.generateRefreshToken(user);

			user.refreshToken = [];
			user.refreshToken.push(dbRefreshToken);
			await user.save();

			const tokens: ITokens = {
				token: `Bearer: ${token}`,
				refreshToken: `Bearer: ${dbRefreshToken.refreshToken}`,
				userId: dbRefreshToken.userId,
				isActiveUser: true,
			};

			return tokens;
		} catch (err) {
			return throwError(err.statusCode, err.message);
		}
	};

	removeRefreshTokensFromDb = async (userId: string) => {
		try {
			const refreshToken = await RefreshToken.findOne({ userId: userId });
			if (refreshToken) {
				refreshToken.remove();
			}
		} catch (err) {
			return throwError(err.statusCode, err.message);
		}
	};
}
