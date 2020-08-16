import dotenv from 'dotenv';
// don't try to load .env file on Heroku
if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

let env = process.env.NODE_ENV!.toUpperCase();

//port
export const PORT = process.env[`PORT_${env}`];
//MongoDb
export const DB_URL = process.env[`DB_URL_${env}`];

//JWT

export const JWT_TOKEN_SECRET_KEY = process.env[`TOKEN_SECRET_KEY_${env}`],
	JWT_REFRESHTOKEN_SECRET_KEY = process.env[`REFRESH_TOKEN_SECRET_KEY_${env}`],
	TOKEN_EXPIRATION = process.env[`TOKEN_EXPIRATION_${env}`],
	REFRESH_TOKEN_EXPIRATION = process.env[`REFRESH_TOKEN_EXPIRATION_${env}`];

//MAILJET
export const MAILJET_API_KEY_PUBLIC = process.env[`MJ_APIKEY_PUBLIC_${env}`],
	MAILJET_API_KEY_PRIVATE = process.env[`MJ_APIKEY_PRIVATE_${env}`];

//MAIL
export const MAIL_SENDER = process.env[`MAIL_SENDER_${env}`],
	MAIL_WRITER = process.env[`MAIL_WRITER_${env}`],
	MAIL_SUBJECT = process.env[`MAIL_SUBJECT_${env}`];
