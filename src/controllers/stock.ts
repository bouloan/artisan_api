import { NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { IError } from '../middlewares/errors';
import Item, { IItem } from '../models/item';
import User, { IUser } from '../models/user';
import { throwValidationErrorIfExist } from '../services/validation.service';

const fs = require('fs');
const ObjectId = mongoose.Types.ObjectId;

export const addItem: RequestHandler = async (req, res, next) => {
	const errors = validationResult(req);
	throwValidationErrorIfExist(errors);
	let itemRequest = req.body as IItem;
	let creator: IUser;
	if (req.file) {
		let imageUrl = req.file.path.replace('\\', '/');
		itemRequest.imageUrl = imageUrl;
	}
	const item = new Item(itemRequest);
	//item is linked to a user
	item.creator = req.body.userId;
	try {
		const user = await User.findById(item.creator);
		if (!user) {
			const error: IError = new Error('Ajout non authorisé');
			error.statusCode = 403;
			throw error;
		}
		creator = user;
		user.items.push(item);
		await user.save();
		await item.save();
		res.status(200).json({
			message: "l'article a été ajouté",
			item: item,
			creator: { _id: creator._id, name: creator.name }
		});
	} catch (err) {
		send500StatusError(err, next);
	}
};

export const updateItem: RequestHandler = async (req, res, next) => {
	const errors = validationResult(req);
	throwValidationErrorIfExist(errors);
	const itemId = req.params.itemId;
	try {
		let item = await Item.findById(itemId);
		if (!item) {
			return notFoundItemError();
		}
		if (req.body.userId !== item.creator.toString()) {
			return noUserError();
		}
		let itemRequest = req.body as IItem;
		if (req.file) {
			let imageUrl = req.file.path.replace('\\', '/');
			itemRequest.imageUrl = imageUrl;
			deleteFormerImage(item as IItem);
		}
		item = Object.assign(item, itemRequest);
		const result = await item.save();
		res.status(200).json({ message: "l'article a été modifié", content: result });
	} catch (err) {
		send500StatusError(err, next);
	}
};

export const getItems: RequestHandler = async (req, res, next) => {
	//creation of pagination
	/* penser à ajouter le paramètere de pagintation dans l'url de la requête en front */
	const currentPage = req.query.page || 1;
	const perPage = 5; /* à modifier dynamiquement par le front */
	try {
		const totalItems = await Item.find({
			creator: new ObjectId(req.body.userId)
		}).countDocuments();
		if (totalItems === 0) {
			return notFoundItemError();
		}
		const items = await Item.find({ creator: new ObjectId(req.body.userId) })
			.skip((currentPage - 1) * perPage)
			.limit(perPage);
		if (!items) {
			return notFoundItemError();
		}
		res.status(200).json({
			message: 'Tous les items ont été récupérés',
			items: items,
			totalItems: totalItems
		});
	} catch (err) {
		send500StatusError(err, next);
	}
};

export const getItem: RequestHandler = async (req, res, next) => {
	const itemId = req.params.itemId;

	try {
		const item = await Item.findById(itemId);
		//if there is no item in db, an error is thrown
		if (!item) {
			return notFoundItemError();
		}
		if (req.body.userId !== item.creator.toString()) {
			return noUserError();
		}
		res.status(200).json({ message: "L'item est récupéré", item: item });
	} catch (err) {
		send500StatusError(err, next);
	}
};

export const deleteItem: RequestHandler = async (req, res, next) => {
	const itemId = req.params.itemId;
	try {
		const item = await Item.findById(itemId);
		if (!item) {
			return notFoundItemError();
		}
		if (req.body.userId !== item.creator.toString()) {
			return noUserError();
		}
		deleteFormerImage(item);
		await Item.findByIdAndRemove(itemId);
		const user = await User.findById(req.body.userId);
		if (!user) {
			return noUserError();
		}
		user.items = user.items.filter((item) => {
			return item.toString() !== itemId;
		});
		await user.save();
		res.status(200).json({ message: "L'article a été supprimé" });
	} catch (err) {
		send500StatusError(err, next);
	}
};

const notFoundItemError = () => {
	const error: IError = new Error('Could not find item');
	error.statusCode = 404;
	throw error;
};

const noUserError = () => {
	const error: IError = new Error('modification non authorisée');
	error.statusCode = 403;
	throw error;
};

const send500StatusError = (err: IError, next: NextFunction) => {
	if (!err.statusCode) {
		err.statusCode = 500;
	}
	next(err);
};

const deleteFormerImage = (item: IItem) => {
	return fs.unlink(`${item.imageUrl}`, (err: any) => console.log(err));
};
