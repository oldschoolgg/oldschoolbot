const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');

const { roll } = require('../../../config/util');
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

		const donationMessage = `Old School Bot is in huge need for donations for server costs. Please consider joining the support server (${
			msg.guild ? msg.guild.settings.prefix : '+'
		}support) if you're able to help.\n`;

		const shouldShow = roll(3);

		const result = await this.client.killWorkerThread(quantity, bossName);
		if (typeof result === 'string') {
			return msg.send(shouldShow ? donationMessage + result : result);
		}
		return msg.send(
			shouldShow ? donationMessage : '',
			new MessageAttachment(Buffer.from(generateBankImage(result)), 'osbot.png')
		);
	}
};
