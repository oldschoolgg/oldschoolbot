// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
const { Extendable } = require('klasa');
const { DMChannel, TextChannel } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [DMChannel, TextChannel] });
	}

	async fetchImage() {
		const messageBank = await this.messages.fetch({ limit: 20 });

		for (const message of messageBank.values()) {
			const fetchedAttachment = message.attachments.first();
			if (fetchedAttachment && fetchedAttachment.height) return fetchedAttachment;
		}

		throw `Couldn't find an image.`;
	}

};
