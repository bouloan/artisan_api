import { throwError } from '../../middlewares/errors';
import User, { IUser } from '../models/user';

export class UserRepo {
	async findByEmail(email: string): Promise<IUser> {
		try {
			const result = await User.findOne({ email: email });
			if (!result) {
				return throwError(
					404,
					"Aucun utilisateur n'est enregistré avec cette adresse mail"
				);
			}
			return result;
		} catch (e) {
			return throwError(e.statusCode, e.message);
		}
	}
}
