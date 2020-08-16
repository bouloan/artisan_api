import { NextFunction, Request, Response } from 'express';

export interface IError extends Error {
	statusCode?: number;
}

export const errors = (
	err: IError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const status = err.statusCode || 500;
	const message = err.message;
	res.status(status).json({ message: message });
};

export const throwError = (status: number, message: string) => {
	const error: IError = new Error(message);
	error.statusCode = status;
	throw error;
};

export const sendError = (err: IError, next: NextFunction) => {
	if (!err.statusCode) {
		err.statusCode = 500;
	}
	next(err);
};
