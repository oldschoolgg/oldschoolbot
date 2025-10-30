'use strict';

const { Collection } = require('@discordjs/collection');
const { Routes } = require('discord-api-types/v10');
const { DiscordjsError, DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { GuildChannel } = require('../structures/GuildChannel.js');
const { ThreadChannel } = require('../structures/ThreadChannel.js');
const { Webhook } = require('../structures/Webhook.js');
const { ThreadChannelTypes } = require('../util/Constants.js');
const { resolveImage } = require('../util/DataResolver.js');
const { setPosition } = require('../util/Util.js');
const { CachedManager } = require('./CachedManager.js');
const { GuildTextThreadManager } = require('./GuildTextThreadManager.js');

class GuildChannelManager extends CachedManager {
	constructor(guild, iterable) {
		super(guild.client, GuildChannel, iterable);

		this.guild = guild;
	}

	get channelCountWithoutThreads() {
		return this.cache.reduce((acc, channel) => {
			if (ThreadChannelTypes.includes(channel.type)) return acc;
			return acc + 1;
		}, 0);
	}

	_add(channel) {
		const existing = this.cache.get(channel.id);
		if (existing) return existing;
		this.cache.set(channel.id, channel);
		return channel;
	}

	resolve(channel) {
		if (channel instanceof ThreadChannel) return super.cache.get(channel.id) ?? null;
		return super.resolve(channel);
	}

	resolveId(channel) {
		if (channel instanceof ThreadChannel) return super.resolveId(channel.id);
		return super.resolveId(channel);
	}

	async createWebhook({ channel, name, avatar, reason }) {
		const channelId = this.resolveId(channel);
		if (!channelId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');

		const resolvedAvatar = await resolveImage(avatar);

		const data = await this.client.rest.post(Routes.channelWebhooks(channelId), {
			body: {
				name,
				avatar: resolvedAvatar,
			},
			reason,
		});

		return new Webhook(this.client, data);
	}

	async setPosition(channel, position, { relative, reason } = {}) {
		const resolvedChannel = this.resolve(channel);
		if (!resolvedChannel) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');

		const updatedChannels = await setPosition(
			resolvedChannel,
			position,
			relative,
			this.guild._sortedChannels(resolvedChannel),
			this.client,
			Routes.guildChannels(this.guild.id),
			reason,
		);

		this.client.actions.GuildChannelsPositionUpdate.handle({
			guild_id: this.guild.id,
			channels: updatedChannels,
		});

		return resolvedChannel;
	}

	async fetch(id, { cache = true, force = false } = {}) {
		if (id && !force) {
			const existing = this.cache.get(id);
			if (existing) return existing;
		}

		if (id) {
			const innerData = await this.client.rest.get(Routes.channel(id));
			// Since this is the guild manager, throw if on a different guild
			if (this.guild.id !== innerData.guild_id) throw new DiscordjsError(ErrorCodes.GuildChannelUnowned);
			return this.client.channels._add(innerData, this.guild, { cache });
		}

		const data = await this.client.rest.get(Routes.guildChannels(this.guild.id));
		const channels = new Collection();
		for (const channel of data) channels.set(channel.id, this.client.channels._add(channel, this.guild, { cache }));
		return channels;
	}

	async fetchWebhooks(channel) {
		const id = this.resolveId(channel);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');
		const data = await this.client.rest.get(Routes.channelWebhooks(id));
		return data.reduce((hooks, hook) => hooks.set(hook.id, new Webhook(this.client, hook)), new Collection());
	}

	async fetchActiveThreads(cache = true) {
		const data = await this.rawFetchGuildActiveThreads();
		return GuildTextThreadManager._mapThreads(data, this.client, { guild: this.guild, cache });
	}

	async rawFetchGuildActiveThreads() {
		return this.client.rest.get(Routes.guildActiveThreads(this.guild.id));
	}

	async delete(channel, reason) {
		const id = this.resolveId(channel);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'channel', 'GuildChannelResolvable');
		await this.client.rest.delete(Routes.channel(id), { reason });
		this.client.actions.ChannelDelete.handle({ id });
	}
}

exports.GuildChannelManager = GuildChannelManager;
