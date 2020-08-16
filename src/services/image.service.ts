import fs from 'fs';
import path from 'path';

export class ImageService {
	uploadAndRetrieveImage(base64Image: string, userId: string) {
		//check if an image exist
		let matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
		if (matches != null) {
			let imageName = this.defineRandomString();
			let imageContentType = this.extractContentType(base64Image);
			let imagePath = this.recordImageInImagesFolder(
				base64Image,
				imageName,
				imageContentType,
				userId
			);

			return imagePath;
		}
		return null;
	}

	defineRandomString() {
		return (
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15)
		);
	}

	extractContentType(base64Image: string) {
		let block = base64Image.split(';');
		// Get the content type of the image
		let contentType = block[0].split('/')[1];
		return contentType;
	}

	recordImageInImagesFolder(
		imageData: string,
		imageName: string,
		imageContentType: string,
		userId: string
	) {
		let dir = `../images/${userId}`;
		// if the folder name with userId does not exist, we create it
		if (!fs.existsSync(path.join(__dirname, dir))) {
			fs.mkdirSync(path.join(__dirname, dir));
		}
		let data = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

		let buf = Buffer.from(data![2], 'base64');
		fs.writeFile(
			path.join(__dirname, `${dir}/${imageName}.${imageContentType}`),
			buf,
			(e: any) => {
				if (e) {
					console.error(e);
					return;
				}
			}
		);

		return `images/${userId}/${imageName}.${imageContentType}`;
	}

	deleteFormerImageFromIMagesFolder(image: string) {
		let dir = `../${image}`;
		fs.unlink(path.join(__dirname, `${dir}`), function (err) {
			if (err) throw err;
		});
	}
}
