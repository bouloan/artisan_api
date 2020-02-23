import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { sign } from 'jsonwebtoken';
import { IError } from '../middlewares/errors';
import User, { ILoginUser, IUser } from '../models/user';
import { throwValidationErrorIfExist } from '../services/validation.service';

dotenv.config();

export const signup: RequestHandler = async (req, res, next) => {
	const errors = validationResult(req);
	throwValidationErrorIfExist(errors);
	const requestUser: IUser = req.body;
	try {
		const hashedPwd = await bcryptjs.hash(requestUser.password, 12);
		requestUser.password = hashedPwd;
		const user = new User(requestUser);
		const result = await user.save();
		return res
			.status(201)
			.json({ message: "L'utilisateur a été enregistré", userId: result._id });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

export const login: RequestHandler = async (req, res, next) => {
	const loginUser: ILoginUser = req.body;
	let loadedUser: IUser;
	//vérifie si le mail est dans la bdd
	try {
		const user = await User.findOne({ email: loginUser.email });
		if (!user) {
			const error: IError = new Error("Aucun n'utilisateur n'est rattaché à cet email");
			error.statusCode = 401;
			throw error;
		}
		loadedUser = user;
		const passwordsAreEqual = await bcryptjs.compare(loginUser.password, loadedUser.password);
		if (!passwordsAreEqual) {
			const error: IError = new Error('Les identifiants ne sont pas valides');
			error.statusCode = 401;
			throw error;
		}
		const token = sign(
			{
				email: loadedUser.email,
				userId: loadedUser._id.toString()
			},
			`${process.env.JWT_SECRET_KEY}`,
			{ expiresIn: '1h' }
		);
		res.status(200).json({ token: `Bearer: ${token}`, userId: loadedUser._id.toString() });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
