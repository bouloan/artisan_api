import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_TOKEN_SECRET_KEY } from './../env';
import { IError } from './errors';

interface IdecodedToken {
	email: string;
	userId: string;
	iat: number;
	exp: number;
}

export const verifyJWT: RequestHandler = (req, res, next) => {
	let token = req.get('Authorization');
	if (token) {
		token = token.split(' ')[1];
	} else {
		//il n'y a pas de token lié à la requête
		const error: IError = new Error('Utilisateur non authentitifé');
		error.statusCode = 401;
		throw error;
	}
	//if token is valid, use id is linked to the body request
	verify(token, `${JWT_TOKEN_SECRET_KEY}`, function (err, token) {
		if (err) {
			//le token n'est pas valide
			const error: IError = new Error('Token non valide');
			error.statusCode = 401;
			throw error;
		} else {
			req.body.userId = (token as IdecodedToken).userId;
			next();
		}
	});
};
