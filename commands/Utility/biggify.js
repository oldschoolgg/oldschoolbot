const { Command, util: { sleep } } = require('klasa');
const { MessageAttachment } = require('discord.js');
const Jimp = require('jimp');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Makes a big version of an image.' });
	}

	async run(msg) {
		const { url } = await this.checkChatForImage(msg);
		const img = await Jimp.read(url);
		img.resize(400, Jimp.AUTO);
		const chunkHeight = img.bitmap.height / 4;
		for (let i = 0; i <= 3; i++) {
			const tempImg = img.clone().crop(0, chunkHeight * i, 400, chunkHeight);
			await sleep(100);
			tempImg.getBuffer('image/png', (err, buffer) => {
				if (err) throw err;
				return msg.send(new MessageAttachment(buffer, 'image.png'));
			});
		}
	}

};
