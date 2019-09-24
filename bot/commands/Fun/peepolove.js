const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { Canvas } = require('canvas-constructor');
const fs = require('fs');
const fetch = require('node-fetch');
const peepoBody = fs.readFileSync('./resources/images/peepoBody.png');
const peepoHands = fs.readFileSync('./resources/images/peepoHands.png');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Generates a peepoLove image from a given image/avatar.',
			cooldown: 7,
			usage: '<person:user>',
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	async parseURL(imageURL) {
		const imageBuffer = await fetch(imageURL).then(result => result.buffer());
		return imageBuffer;
	}

	async run(msg, [user]) {
		const userImage = await this.parseURL(user.displayAvatarURL({ size: 512, format: 'png' }));

		const imageBuff = new Canvas(512, 512)
			.addImage(peepoBody, 0, 0)
			.rotate(-0.4)
			.addImage(userImage, -210, 512 - 241, 330, 330, {
				type: 'round',
				radius: 330 / 2,
				restore: true
			})
			.rotate(0.4)
			.addImage(peepoHands, 0, 0)
			.toBufferAsync();

		const finishedImage = new MessageAttachment(await imageBuff, `peepoLove.png`);
		return msg.send(finishedImage);
	}
};
