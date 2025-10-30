'use strict';

const { GuildChannel } = require('../structures/GuildChannel.js');
const { DataManager } = require('./DataManager.js');

class CategoryChannelChildManager extends DataManager {
	constructor(channel) {
		super(channel.client, GuildChannel);

		this.channel = channel;
	}

	get cache() {
		return this.guild.channels.cache.filter(channel => channel.parentId === this.channel.id);
	}

	get guild() {
		return this.channel.guild;
	}

	async create(options) {
		return this.guild.channels.create({
			...options,
			parent: this.channel.id,
		});
	}
}

exports.CategoryChannelChildManager = CategoryChannelChildManager;
