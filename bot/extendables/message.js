const { Extendable } = require('klasa');
const { Message } = require('discord.js');

module.exports = class extends Extendable {
	constructor(...args) {
		super(...args, { appliesTo: [Message] });
	}

	async sendLarge(
		content,
		fileName = 'large-response.txt',
		messageTooLong = 'Response was too long, please see text file.'
	) {
		if (content.length <= 2000 && !this.flagArgs.file) return this.send(content);

		return this.channel.sendFile(Buffer.from(content), fileName, messageTooLong);
	}
};
