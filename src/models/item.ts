import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
	name: string;
	brand: string;
	imageUrl: string;
	reference: string;
	supplier: string;
	supplierWebsite: string;
	quantity: number;
	minQuantity: number;
	creator: number;
}

const ItemSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: true,
			minlength: 5
		},
		brand: {
			type: String,
			required: true,
			minlength: 5
		},
		imageUrl: {
			type: String,
			required: false
		},
		reference: {
			type: String,
			required: false,
			minlength: 5
		},
		supplier: {
			type: String,
			required: false,
			minlength: 5
		},
		supplierWebsite: {
			type: String,
			required: false
		},
		quantity: {
			type: Number,
			required: true,
			min: [ 0, 'quantity must be higher than 0' ]
		},
		minQuantity: {
			type: Number,
			required: true,
			min: [ 0, 'minQuantity must be higher than 0' ]
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{ timestamps: true }
);

export default mongoose.model<IItem>('Item', ItemSchema);
