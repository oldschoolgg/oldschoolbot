const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs');
const bg = fs.readFileSync('./resources/pm-bg.png');
const canvas = createCanvas(376, 174);
const ctx = canvas.getContext('2d');

ctx.font = '16px OSRSFont';

registerFont('./resources/OSRSFont.ttf', { family: 'Regular' });

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Fake a private message from someone.',
			cooldown: 3,
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<username:str> <message:str>',
			usageDelim: ','
		});
	}

	async run(msg, [username, message]) {
		const BG = new Image();
		BG.src = bg;
		ctx.drawImage(BG, 0, 0, BG.width, BG.height);

		ctx.fillStyle = '#000000';
		ctx.fillText(`From ${username}: ${message}`, 6, 98);
		ctx.fillStyle = '#00ffff';
		ctx.fillText(`From ${username}: ${message}`, 5, 97);


		return msg.send(new MessageAttachment(canvas.toBuffer(), `${Math.round(Math.random() * 10000)}.jpg`));
	}

};
