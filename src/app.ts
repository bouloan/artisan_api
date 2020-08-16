import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { DB_URL, PORT } from './env';
import { cors } from './middlewares/cors';
import { errors } from './middlewares/errors';
import { fileFilter } from './middlewares/uploadFile';
import authRoutes from './routes/auth';
import stockRoutes from './routes/stock';

export interface IError extends Error {
	statusCode?: number;
}

const app = express();

//middleware permettant de sécurisé en mettant en place différents headers
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self"],
				styleSrc: ["'self"],
				scriptSrc: ["'self"],
				reportUri: '/report-violation',
				objectSrc: ["'self"],
				upgradeInsecureRequests: true,
			},
		},
		referrerPolicy: { policy: 'same-origin' },
	})
);

app.use(compression());

//middleware permettant de parser les requêtes et d'extraires les données en json
app.use(json({ limit: '5mb' }));

app.use(urlencoded({ limit: '5mb', extended: true }));

app.use(
	multer({ dest: `${__dirname}/images`, fileFilter: fileFilter }).single(
		'image'
	)
);

app.use('/api/images', express.static(path.join(__dirname, 'images')));

//middleware permettant d'éviter les problèmes de cors
app.use(cors);

app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);

//middleware permettant de gérer les erreurs
app.use(errors);
mongoose
	.connect(`${DB_URL}`)
	.then(() => {
		console.log('connected to mongDb');
		app.listen(`${PORT}`);
	})
	.catch((err) => console.error(err));
