import mongoose, { Document, Schema } from 'mongoose';
import { REFRESH_TOKEN_EXPIRATION } from '../../env';

export interface IRefreshToken extends Document {
	refreshToken: string;
	userId: string;
}

const RefreshTokenSchema: Schema = new Schema(
	{
		refreshToken: {
			type: String,
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true }
);

RefreshTokenSchema.index(
	{ createdAt: 1 },
	{ expires: REFRESH_TOKEN_EXPIRATION }
);

export default mongoose.model<IRefreshToken>(
	'RefreshToken',
	RefreshTokenSchema
);
