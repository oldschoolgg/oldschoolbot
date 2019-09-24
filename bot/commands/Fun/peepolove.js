const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { createCanvas, Image } = require('canvas');
const fs = require('fs');

const peepoBody = fs.readFileSync('./resources/images/peepoBody.png');
const peepoHands = fs.readFileSync('./resources/images/peepoHands.png');

const CANVAS_LENGTH = 512;

const canvas = createCanvas(CANVAS_LENGTH, CANVAS_LENGTH);
const ctx = canvas.getContext('2d');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Shows how much virtual GP you have',
			cooldown: 3,
			usage: '(image:image)',
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	async loadImage(buffer) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = err => reject(err);
			img.src = buffer;
		});
	}

	async drawImage(image, x, y, scale, rotation) {
		ctx.setTransform(scale, 0, 0, scale, x, y);
		ctx.rotate(rotation);
		ctx.drawImage(image, -image.width / 2, -image.height / 2);
	}

	async run(msg, [[image]]) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const background = await this.loadImage(peepoBody);
		ctx.drawImage(background, 0, 0, background.width, background.height);
		const userImage = await this.loadImage(image);
		ctx.setTransform(0.6, 0, 0, 0.6, userImage.width * 0.4 - 100, 400);

		ctx.rotate((-23 * Math.PI) / 180);

		ctx.drawImage(userImage, -userImage.width / 2, -userImage.height / 2);

		ctx.setTransform(1, 0, 0, 1, 0, 0);

		const handsImage = await this.loadImage(peepoHands);
		ctx.drawImage(handsImage, 0, 0, background.width, background.height);

		const finishedImage = new MessageAttachment(canvas.toBuffer(), `peepoLove.png`);
		return msg.send(finishedImage);
	}
};
