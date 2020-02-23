import { NextFunction, Request, Response } from 'express';

export interface IError extends Error {
	statusCode?: number;
}

export const errors = (err: IError, req: Request, res: Response, next: NextFunction) => {
	const status = err.statusCode || 500;
	const message = err.message;
	res.status(status).json({ message: message });
};
