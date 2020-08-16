import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
	userId: string;
	designation: string;
	brand: string;
	image: string;
	reference: string;
	supplier: string;
	supplierWebsite: string;
	quantity: number;
	minQuantity: number;
	creator: string;
}

const ItemSchema: Schema = new Schema({
	designation: {
		type: String,
		required: [true, "L'intitulé de l'item est requis"],
		minlength: 2,
		maxlength: 50,
	},
	brand: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 50,
	},
	image: {
		type: String,
		required: false,
	},
	reference: {
		type: String,
		required: [false, "L'intitulé de la référence est requise"],

		maxlength: 50,
	},
	supplier: {
		type: String,
		required: false,

		maxlength: 50,
	},
	supplierWebsite: {
		type: String,
		required: false,
	},
	quantity: {
		type: Number,
		required: true,
		min: [0, 'quantity must be higher than 0'],
	},
	minQuantity: {
		type: Number,
		required: true,
		min: [0, 'minQuantity must be higher than 0'],
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

export default mongoose.model<IItem>('Item', ItemSchema);
