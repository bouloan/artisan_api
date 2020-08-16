import { Result, ValidationError } from 'express-validator';
import { IError } from '../middlewares/errors';

export const throwValidationErrorIfExist = (
	errors: Result<ValidationError>
) => {
	if (!errors.isEmpty()) {
		let errorMessage: string = '';
		errors.array().forEach((a) => {
			errorMessage += `${a.msg}. `;
		});
		errorMessage = errorMessage.slice(0, -1);
		const error: IError = new Error(errorMessage);
		error.statusCode = 400;
		throw error;
	}
};
