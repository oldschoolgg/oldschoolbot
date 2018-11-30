const { Command } = require('klasa');
const jimp = require('jimp');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Makes a big version of an image.' });
	}

	async run(msg) {
		const { url } = await msg.channel.fetchImage();
		const img = await jimp.read(url);
		img.resize(400, jimp.AUTO);
		const chunkHeight = img.bitmap.height / 4;
		for (let i = 0; i <= 3; i++) {
			const tempImg = img.clone().crop(0, chunkHeight * i, 400, chunkHeight);
			await new Promise((resolve, reject) => {
				tempImg.getBuffer('image/png', (err, buffer) => err ?
					reject(err) :
					resolve(msg.channel.sendFile(buffer, 'image.png')));
			});
		}
	}

};
