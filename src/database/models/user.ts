import mongoose, { Document, Schema } from 'mongoose';
import { IItem } from './item';
import { IRefreshToken } from './refreshToken';

export interface ILoginUser extends Document {
	email: string;
	password: string;
}

export interface IUser extends ILoginUser {
	firstName: string;
	name: string;
	isActive: boolean;
	items: IItem[];
	refreshToken: IRefreshToken[];
	accountValidationToken: string;
}

const UserSchema: Schema = new Schema(
	{
		firstName: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 50,
		},
		name: {
			type: String,
			required: true,
			minlength: 2,
			maxlength: 50,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			minlength: 5,
			maxlength: 255,
			validate: {
				validator: function (email: string) {
					return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/.test(email);
				},
				message: 'the email is not properly filled',
			},
		},
		password: {
			type: String,
			unique: false,
			validate: {
				validator: function (password: string) {
					return !/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$)/.test(
						password
					);
				},
				message: 'the password is not properly filled',
			},
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		items: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Item',
			},
		],
		refreshToken: [
			{
				type: Schema.Types.ObjectId,
				ref: 'RefreshToken',
			},
		],
		accountValidationToken: { type: String },
	},
	{ timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
