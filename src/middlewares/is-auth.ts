import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';
import { IError } from './errors';

dotenv.config();

interface IdecodedToken {
	email: string;
	userId: string;
	iat: number;
	exp: number;
}

export const verifyJWT: RequestHandler = (req, res, next) => {
	let token = req.get('Authorization');
	let decodedToken;
	if (token) {
		token = token.split(' ')[1];
	} else {
		const error: IError = new Error('Non authentitifé');
		error.statusCode = 401;
		throw error;
	}
	try {
		decodedToken = verify(token, `${process.env.JWT_SECRET_KEY}`);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		throw err;
	}
	if (!decodedToken) {
		const error: IError = new Error('Non authentitifé');
		error.statusCode = 401;
		throw error;
	}

	req.body.userId = (decodedToken as IdecodedToken).userId;
	next();
};
