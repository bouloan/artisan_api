import { json } from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import multer from 'multer';
import { cors } from './middlewares/cors';
import { errors } from './middlewares/errors';
import { fileFilter } from './middlewares/uploadFile';
import authRoutes from './routes/auth';
import stockRoutes from './routes/stock';

export interface IError extends Error {
	statusCode?: number;
}

const app = express();

dotenv.config();

//middleware permettant de sécurisé en mettant en place différents headers
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: [ "'self" ],
				styleSrc: [ "'self" ],
				scriptSrc: [ "'self" ],
				reportUri: '/report-violation',
				objectSrc: [ "'self" ],
				upgradeInsecureRequests: true
			}
		},
		referrerPolicy: { policy: 'same-origin' }
	})
);

//middleware permettant de parser les requêtes et d'extraires les données en json
app.use(json());

app.use(multer({ dest: `${__dirname}/images`, fileFilter: fileFilter }).single('image'));

//middleware permettant d'éviter les problèmes de cors
app.use(cors);

app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
//middleware permettant de gérer les erreurs
app.use(errors);

mongoose
	.connect(`${process.env.DB_URL}`)
	.then(() => {
		console.log('connected to mongDb');
		app.listen(process.env.PORT);
	})
	.catch((err) => console.error(err));
