const nodeMailjet = require('node-mailjet');

import {
	MAILJET_API_KEY_PRIVATE,
	MAILJET_API_KEY_PUBLIC,
	MAIL_SENDER,
	MAIL_SUBJECT,
	MAIL_WRITER,
} from '../env';
import { throwError } from '../middlewares/errors';

const mailjet = nodeMailjet.connect(
	MAILJET_API_KEY_PUBLIC,
	MAILJET_API_KEY_PRIVATE
);

export default class EmailService {
	sendAccountValidationEmail(
		userEmail: string,
		token: string
	): Promise<string> {
		const request = mailjet.post('send').request({
			FromEmail: MAIL_SENDER,
			FromName: MAIL_WRITER,
			Subject: MAIL_SUBJECT,
			'Text-part': `Afin de valider votre compte, veuillez-renseigner le code suivant sur l'application Commis: ${token}`,

			Recipients: [{ Email: userEmail }],
		});

		return request
			.then((result: any) => {
				return 'Un mail vous a été envoyé';
			})
			.catch((err: any) => {
				throwError(500, "Le mail n'a pas pu être transmis");
			});
	}

	sendTemporaryPassword(userEmail: string, password: string): Promise<string> {
		const request = mailjet.post('send').request({
			FromEmail: MAIL_SENDER,
			FromName: MAIL_WRITER,
			Subject: 'Réinitialisation de mot passe',
			'Text-part': `Sur votre demande, votre mot de passe a été réinitialisé. Veuillez-renseigner le mot de passe suivant pour vous connecter sur l'application Commis: ${password}. Pour des raisons de sécurité, ce mot de passe doit être temporaire, veuillez modifier le mot de passe.`,

			Recipients: [{ Email: userEmail }],
		});

		return request
			.then((result: any) => {
				return 'Un mail vous a été envoyé';
			})
			.catch((err: any) => {
				throwError(500, "Le mail n'a pas pu être transmis");
			});
	}
}
