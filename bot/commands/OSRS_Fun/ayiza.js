const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { Canvas } = require('canvas-constructor');
const fs = require('fs');

const BG = fs.readFileSync('./resources/images/ayiza.jpg');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows Mod Ayiza giving a presentation with a message.',
			cooldown: 3,
			botPerms: ['ATTACH_FILES'],
			usage: '<message:str>'
		});
	}

	async run(msg, [message]) {
		const Img = new Canvas(500, 586)
			.addImage(BG, 0, 0, 500, 586)
			.rotate(0.02)
			.setColor('#FFF')
			.setTextFont('25px Arial')
			.addMultilineText(message, 125, 101, 271, 29)
			.resetTransformation()
			.toBuffer();

		return msg.send(new MessageAttachment(Img, `${Math.round(Math.random() * 10000)}.jpg`));
	}

};
