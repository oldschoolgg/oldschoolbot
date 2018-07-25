const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			enabled: true,
			klasa: true
		});
	}

	async extend(msg) {
		const attachment = msg.attachments.first();

		if (attachment && attachment.height) return attachment;

		const MessageBank = await msg.channel.messages.fetch({ limit: 20 });

		for (const message of MessageBank.values()) {
			const fetchedAttachment = message.attachments.first();
			if (fetchedAttachment && fetchedAttachment.height) return fetchedAttachment;
			if (message === MessageBank.last()) throw `Please upload an image.`;
		}

		throw `Couldn't find an image.`;
	}

};
