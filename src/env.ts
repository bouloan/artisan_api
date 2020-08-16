import dotenv from 'dotenv';
// // don't try to load .env file on Heroku
// if (process.env.NODE_ENV !== 'production') {
dotenv.config();
// }

// let env = process.env.NODE_ENV!.toUpperCase();

//port
export const PORT = process.env[`PORT`];
//MongoDb
export const DB_URL = process.env[`DB_URL`];

//JWT

export const JWT_TOKEN_SECRET_KEY = process.env[`TOKEN_SECRET_KEY`],
	JWT_REFRESHTOKEN_SECRET_KEY = process.env[`REFRESH_TOKEN_SECRET_KEY`],
	TOKEN_EXPIRATION = process.env[`TOKEN_EXPIRATION`],
	REFRESH_TOKEN_EXPIRATION = process.env[`REFRESH_TOKEN_EXPIRATION`];

//MAILJET
export const MAILJET_API_KEY_PUBLIC = process.env[`MJ_APIKEY_PUBLIC`],
	MAILJET_API_KEY_PRIVATE = process.env[`MJ_APIKEY_PRIVATE`];

//MAIL
export const MAIL_SENDER = process.env[`MAIL_SENDER`],
	MAIL_WRITER = process.env[`MAIL_WRITER`],
	MAIL_SUBJECT = process.env[`MAIL_SUBJECT`];
