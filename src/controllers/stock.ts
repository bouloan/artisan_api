import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { IItem } from '../database/models/item';
import { sendError } from '../middlewares/errors';
import { StockService } from '../services/stock.service';
import { throwValidationErrorIfExist } from '../services/validation.service';

export default class StockController {
	stockService: StockService = new StockService();

	addItem: RequestHandler = async (req, res, next) => {
		const errors = validationResult(req);
		throwValidationErrorIfExist(errors);
		const itemRequest = req.body as IItem;
		try {
			const result = await this.stockService.addItem(itemRequest);
			res.status(200).json({
				message: "l'article a été ajouté",
				item: result.item,
				creator: { _id: result.user._id, name: result.user.name },
			});
		} catch (err) {
			sendError(err, next);
		}
	};

	updateItem: RequestHandler = async (req, res, next) => {
		const errors = validationResult(req);
		throwValidationErrorIfExist(errors);
		const itemId = req.params.itemId;
		const itemRequest = req.body;
		try {
			const result = await this.stockService.updateItem(itemId, itemRequest);
			res
				.status(200)
				.json({ message: "l'article a été modifié", item: result });
		} catch (err) {
			sendError(err, next);
		}
	};

	getItems: RequestHandler = async (req, res, next) => {
		const itemRequest = req.body;
		//creation of pagination
		/* penser à ajouter le paramètere de pagintation dans l'url de la requête en front */

		// const currentPage = +req.query._page || 1;
		// const perPage =
		// 	+req.query._limit || 10;
		try {
			const results = await this.stockService.getItems(itemRequest);

			res.status(200).json({
				items: results.items,
				totalItems: results.totalItems,
			});
		} catch (err) {
			sendError(err, next);
		}
	};

	getItem: RequestHandler = async (req, res, next) => {
		const itemId = req.params.itemId;
		const itemRequest = req.body;
		try {
			const result = await this.stockService.getItem(itemId, itemRequest);
			res.status(200).json({ message: "L'item est récupéré", item: result });
		} catch (err) {
			sendError(err, next);
		}
	};

	deleteItem: RequestHandler = async (req, res, next) => {
		const itemId = req.params.itemId;
		const itemRequest = req.body;
		try {
			const result = await this.stockService.deleteItem(itemId, itemRequest);
			if (result) {
				res.status(200).json({ message: "L'article a été supprimé" });
			}
		} catch (err) {
			sendError(err, next);
		}
	};
}
