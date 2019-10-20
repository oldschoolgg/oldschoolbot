const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');

const generateBankImage = require('../../../data/new_monsters/utils/generateBankImage');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 1,
			description: 'Simulate killing bosses (shows only rare drops).',
			usage: '<quantity:int{1}> <BossName:...str>',
			usageDelim: ' '
		});
	}
	async run(msg, [quantity, bossName]) {
		if (!this.client.killWorkerThread) return;
		const result = await this.client.killWorkerThread(quantity, bossName);
		if (typeof result === 'string') return msg.send(result);
		return msg.send(new MessageAttachment(Buffer.from(generateBankImage(result)), 'osbot.png'));
	}
};
