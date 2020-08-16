import mongoose from 'mongoose';
import User from '../database/models/user';
import { throwError } from '../middlewares/errors';
import Item, { IItem } from './../database/models/item';
import { ImageService } from './image.service';

const ObjectId = mongoose.Types.ObjectId;

export class StockService {
	imageService: ImageService = new ImageService();

	async addItem(itemRequest: IItem) {
		itemRequest = this.convertObjectValuesToLowerCase(itemRequest);
		const item = new Item(itemRequest);
		//item is linked to a user
		item.creator = itemRequest.userId;
		item.image = this.imageService.uploadAndRetrieveImage(
			itemRequest.image,
			itemRequest.userId
		) as string;
		//check if the user exist in db, if not, he can not add item
		const essai = new ObjectId(itemRequest.userId);
		const user = await User.findOne({
			_id: essai,
		});
		if (!user) {
			return throwError(403, 'Ajout non authorisé');
		}
		//check if the item already exist in db
		const existedItem = await Item.findOne({
			designation: itemRequest.designation,
		});
		if (existedItem) {
			return throwError(404, 'Un item porte déjà cette désignation');
		}
		user.items.push(item);
		await user.save();
		await item.save();
		return { user: user, item: item };
	}

	async updateItem(itemId: string, itemRequest: IItem) {
		let item = await Item.findById(itemId);
		if (!item) {
			return throwError(404, 'Could not find item');
		}
		if (itemRequest.userId !== item.creator.toString()) {
			return throwError(403, 'modification non authorisée');
		}
		itemRequest = this.convertObjectValuesToLowerCase(itemRequest);
		if (item.image) {
			this.imageService.deleteFormerImageFromIMagesFolder(item.image);
			itemRequest.image = this.imageService.uploadAndRetrieveImage(
				itemRequest.image,
				itemRequest.userId
			) as string;
		}

		item = Object.assign(item, itemRequest);
		return await item.save();
	}

	async getItems(itemRequest: IItem) {
		const totalItems = await Item.find({
			creator: new ObjectId(itemRequest.userId),
		}).countDocuments();
		let items: IItem[];
		if (totalItems === 0) {
			items = [];
			// return throwError(404, 'Could not find item');
		} else {
			items = await Item.find({ creator: new ObjectId(itemRequest.userId) });
			// .skip((currentPage - 1) * perPage)
			// .limit(perPage);
			if (!items) {
				return throwError(404, 'Could not find item');
			}
		}
		return { items: items, totalItems: totalItems };
	}

	async getItem(itemId: string, itemRequest: IItem) {
		const item = await Item.findById(itemId);
		//if there is no item in db, an error is thrown
		if (!item) {
			return throwError(404, 'Could not find item');
		}
		if (itemRequest.userId !== item.creator.toString()) {
			return throwError(403, 'modification non authorisée');
		}
		return item;
	}

	async deleteItem(itemId: string, itemRequest: IItem) {
		const item = await Item.findById(itemId);
		if (!item) {
			return throwError(404, 'Could not find item');
		}
		if (itemRequest.userId !== item.creator.toString()) {
			return throwError(403, 'modification non authorisée');
		}
		if (item.image) {
			this.imageService.deleteFormerImageFromIMagesFolder(item.image);
		}

		await Item.findByIdAndRemove(itemId);
		const user = await User.findById(itemRequest.userId);
		if (!user) {
			return throwError(403, 'modification non authorisée');
		}
		user.items = user.items.filter((item) => {
			return item.toString() !== itemId;
		});
		return await user.save();
	}

	convertObjectValuesToLowerCase(object: {}) {
		let ob = <any>{};
		for (let [key, value] of Object.entries(object)) {
			if (key != 'image' && typeof value === 'string') {
				ob[key] = value.toLowerCase();
			} else {
				ob[key] = value;
			}
		}
		return { ...ob };
	}
}
