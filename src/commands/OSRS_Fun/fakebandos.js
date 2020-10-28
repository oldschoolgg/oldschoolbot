const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');
const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs');

const bg = fs.readFileSync('./resources/images/tob-bg.png');
const canvas = createCanvas(399, 100);
const ctx = canvas.getContext('2d');
const { rand } = require('../../lib/util');

ctx.font = '16px OSRSFont';

registerFont('./resources/osrs-font.ttf', { family: 'Regular' });

const randomMessages = ['omfgggggg', '!#@$@#$@##@$', 'adfsjklfadkjsl;l', 'l00000l wtf'];

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Fake yourself getting bandos loot!',
			cooldown: 3,
			requiredPermissions: ['ATTACH_FILES'],
			usage: '(username:string) [kc:int{1,999999}]',
			usageDelim: ','
		});
	}

	async run(msg, [username, kc = rand(1, 150)]) {
		ctx.fillStyle = '#000000';
		const BG = new Image();
		BG.src = bg;
		ctx.drawImage(BG, 0, 0, BG.width, BG.height);

		ctx.fillText('Your General Graardor kill count is: ', 11, 10);
		ctx.fillStyle = '#ff0000';
		ctx.fillText(kc, 12 + ctx.measureText('Your General Graardor kill count is: ').width, 10);

		ctx.fillStyle = '#ff0000';
		ctx.fillText(`You have a funny feeling like you're being followed.`, 11, 25);

		ctx.fillStyle = '#005f00';
		ctx.fillText(`${username} received a drop: Pet general graardor`, 11, 40);

		ctx.fillStyle = '#005f00';
		ctx.fillText(
			`${username} received a drop: Bandos ${Math.random() > 0.5 ? 'chestplate' : 'tassets'}`,
			11,
			54
		);

		/* Username */
		const randMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
		ctx.fillStyle = '#000000';
		ctx.fillText(`${username}: `, 11, 69);
		ctx.fillStyle = '#0000ff';
		ctx.fillText(`${randMessage}*`, 12 + ctx.measureText(`${username}: `).width, 69);

		return msg.send(
			new MessageAttachment(canvas.toBuffer(), `${Math.round(Math.random() * 10000)}.jpg`)
		);
	}
};
