const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { Canvas } = require('canvas-constructor');
const fs = require('fs');
const peepoBody = fs.readFileSync('./resources/images/peepoBody.png');
const peepoHands = fs.readFileSync('./resources/images/peepoHands.png');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Generates a peepoLove image from a given image/avatar.',
			cooldown: 7,
			usage: '<image:image>',
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	async run(msg, [[imageBuffer]]) {
		const imageBuff = new Canvas(512, 512)
			.addImage(peepoBody, 0, 0)
			.rotate(-0.4)
			.addImage(imageBuffer, -210, 512 - 241, 330, 330, {
				type: 'round',
				radius: 330 / 2,
				restore: true
			})
			.rotate(0.4)
			.addImage(peepoHands, 0, 0)
			.toBufferAsync();

		const finishedImage = new MessageAttachment(await imageBuff, `peepoLove.png`);
		return msg.send(
			`You can now use this command with any images, just upload the image or type the command after someone has sent an image.`,
			finishedImage
		);
	}
};
