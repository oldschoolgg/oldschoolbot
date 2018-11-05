const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs');
const bg = fs.readFileSync('./resources/tob-bg.png');
const canvas = createCanvas(399, 100);
const ctx = canvas.getContext('2d');

ctx.font = '16px OSRSFont';

registerFont('./resources/OSRSFont.ttf', { family: 'Regular' });

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Get yourself a Scythe of Vitur!',
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
		/* Your completed Theatre of Blood count is: X. */
		ctx.fillText('Your completed Theatre of Blood count is: ', 11, 10);
		ctx.fillStyle = '#ff0000';
		ctx.fillText(kc, 12 + ctx.measureText('Your completed Theatre of Blood count is: ').width, 10);
		ctx.fillStyle = '#000000';
		ctx.fillText('.', 12 + ctx.measureText(`Your completed Theatre of Blood count is: ${kc}`).width, 10);

		/* Username found something special: Scythe of vitur (uncharged) */
		ctx.fillStyle = '#ff0000';
		ctx.fillText(username, 11, 25);
		ctx.fillStyle = '#000000';
		ctx.fillText(' found something special: ', 12 + ctx.measureText(username).width, 25);
		ctx.fillStyle = '#ff0000';
		ctx.fillText('Scythe of vitur (uncharged)', 12 + ctx.measureText(`${username} found something special: `).width, 25);

		/* Username found something special: Lil' Zik */
		ctx.fillStyle = '#ff0000';
		ctx.fillText(username, 11, 54);
		ctx.fillStyle = '#000000';
		ctx.fillText(' found something special: ', 12 + ctx.measureText(username).width, 54);
		ctx.fillStyle = '#ff0000';
		ctx.fillText("Lil' Zik", 12 + ctx.measureText(`${username} found something special: `).width, 54);

		/* You have a funny feeling like you're being followed. */
		ctx.fillText(`You have a funny feeling like you're being followed.`, 11, 40);

		/* Username */
		ctx.fillStyle = '#000000';
		ctx.fillText(`${username}: `, 11, 70);
		ctx.fillStyle = '#0000ff';
		ctx.fillText('*', 12 + ctx.measureText(`${username}: `).width, 70);

		return msg.send(new MessageAttachment(canvas.toBuffer(), `${Math.round(Math.random() * 10000)}.jpg`));
	}

};
