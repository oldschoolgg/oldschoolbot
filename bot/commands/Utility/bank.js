const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs');

const bg = fs.readFileSync('./resources/images/coins.png');
const canvas = createCanvas(50, 50);
const ctx = canvas.getContext('2d');

ctx.font = '14px OSRSFont';

registerFont('./resources/osrs-font.ttf', { family: 'Regular' });

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows how much virtual GP you have',
			cooldown: 3,
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	async run(msg) {
		const coins = msg.author.settings.get('GP');
		if (coins === 0) {
			throw 'You have no GP yet <:Sad:421822898316115969> You can get some GP by voting for the bot at <https://discordbots.org/bot/303730326692429825/vote>';
		}

		const BG = new Image();
		BG.src = bg;
		ctx.drawImage(BG, 0, 0, BG.width, BG.height);
		let formattedNumber = coins;
		let color = '#FFFF00';
		if (coins > 9999999) {
			formattedNumber = `${Math.floor(coins / 1000000)}M`;
			color = '#00FF80';
		} else if (coins > 99999) {
			formattedNumber = `${Math.floor(coins / 1000)}K`;
			color = '#FFFFFF';
		} else {
			formattedNumber = coins.toString();
		}

		ctx.fillStyle = '#000000';
		ctx.fillText(formattedNumber.split('0').join('O'), 10, 15);
		ctx.fillStyle = color;
		ctx.fillText(formattedNumber.split('0').join('O'), 9, 14);

		const image = new MessageAttachment(canvas.toBuffer(), `bank.jpg`);
		return msg.send(image);
	}

};
