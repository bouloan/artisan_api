import mongoose, { Document, Schema } from 'mongoose';
import { IItem } from './item';

export interface ILoginUser extends Document {
	email: string;
	password: string;
}

export interface IUser extends ILoginUser {
	name: string;
	firstName: string;
	items: IItem[];
}

const UserSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 50
		},
		firstName: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 50
		},
		email: {
			type: String,
			required: true,
			unique: true,
			minlength: 5,
			maxlength: 255,
			validate: {
				validator: function(email: string) {
					return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
				},
				message: 'the email is not properly filled'
			}
		},
		password: {
			type: String,
			unique: false,
			validate: {
				validator: function(password: string) {
					return !/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$)/.test(password);
				},
				message: 'the password is not properly filled'
			}
		},
		items: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Item'
			}
		]
	},
	{ timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
