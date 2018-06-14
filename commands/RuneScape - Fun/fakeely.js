const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs');
const bg = fs.readFileSync('./resources/bg.png');
const canvas = createCanvas(399, 100);
const ctx = canvas.getContext('2d');

ctx.font = '16px OSRSFont';

registerFont('./resources/OSRSFont.ttf', { family: 'Regular' });

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Get yourself a Fake Ely! +fakeely username kc',
			cooldown: 3,
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<kc:int{1,99999999999999999}> <username:str> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [kc, ...username]) {
		username = username.join(' ');
		ctx.fillStyle = '#000000';
		const BG = new Image();
		BG.src = bg;
		ctx.drawImage(BG, 0, 0, BG.width, BG.height);

		ctx.fillText('Your Corporeal Beast kill count is: ', 11, 40);
		ctx.fillStyle = '#ff0000';
		ctx.fillText(kc, 12 + ctx.measureText('Your Corporeal Beast kill count is: ').width, 40);

		ctx.fillStyle = '#005f00';
		ctx.fillText(`${username} received a drop: Elysian sigil`, 11, 54);

		ctx.fillStyle = '#000000';
		ctx.fillText(`${username}: `, 11, 70);
		ctx.fillStyle = '#0000ff';
		ctx.fillText('*', 12 + ctx.measureText(`${username}: `).width, 70);

		return msg.send(new MessageAttachment(canvas.toBuffer(), `${Math.round(Math.random() * 10000)}.jpg`));
	}

};
