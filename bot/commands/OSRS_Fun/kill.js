const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');

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
		msg.send(new MessageAttachment(Buffer.from(result), 'osbot.png'));
	}
};
