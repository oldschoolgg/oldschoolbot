const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { Canvas } = require('canvas-constructor');
const fs = require('fs');

const BG = fs.readFileSync('./resources/images/kieren.jpg');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows Mod Kieren holding a piece of paper with a message.',
			cooldown: 3,
			botPerms: ['ATTACH_FILES'],
			usage: '<message:str>'
		});
	}

	async run(msg, [message]) {
		const Img = new Canvas(510, 816)
			.addImage(BG, 0, 0, 510, 816)
			.rotate(-0.1)
			.setColor('#000')
			.setTextFont('18px Arial')
			.addMultilineText(message, 145, 730, 140, 21)
			.resetTransformation()
			.toBuffer();

		return msg.send(new MessageAttachment(Img, `${Math.round(Math.random() * 10000)}.jpg`));
	}

};
