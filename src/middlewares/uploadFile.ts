import { IError } from '../app';

export const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: any) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		const error: IError = new Error('The image should be a png, jpg or jped file');
		error.statusCode = 422;
		cb(error, false);
	}
};
