'use strict';

const { Collection } = require('@discordjs/collection');
const { makeURLSearchParams } = require('@discordjs/rest');
const { Routes, RouteBases } = require('discord-api-types/v10');
const { ShardClientUtil } = require('../sharding/ShardClientUtil.js');
const { Guild } = require('../structures/Guild.js');
const { GuildChannel } = require('../structures/GuildChannel.js');
const { GuildMember } = require('../structures/GuildMember.js');
const { OAuth2Guild } = require('../structures/OAuth2Guild.js');
const { Role } = require('../structures/Role.js');
const { CachedManager } = require('./CachedManager.js');

class GuildManager extends CachedManager {
	constructor(client, iterable) {
		super(client, Guild, iterable);
	}

	_add(...args) {
		console.log(JSON.stringify(args));
		return super._add(...args);
	}

	resolve(guild) {
		if (
			guild instanceof GuildChannel ||
			guild instanceof GuildMember ||
			guild instanceof Role
		) {
			return super.resolve(guild.guild);
		}

		return super.resolve(guild);
	}

	resolveId(guild) {
		if (
			guild instanceof GuildChannel ||
			guild instanceof GuildMember ||
			guild instanceof Role
		) {
			return super.resolveId(guild.guild.id);
		}

		return super.resolveId(guild);
	}

	async fetch(options = {}) {
		const id = this.resolveId(options) ?? this.resolveId(options.guild);

		if (id) {
			if (!options.force) {
				const existing = this.cache.get(id);
				if (existing) return existing;
			}

			const innerData = await this.client.rest.get(Routes.guild(id), {
				query: makeURLSearchParams({ with_counts: false }),
			});
			innerData.shardId = ShardClientUtil.shardIdForGuildId(id, await this.client.ws.fetchShardCount());
			return this._add(innerData, options.cache);
		}

		const data = await this.client.rest.get(Routes.userGuilds(), { query: makeURLSearchParams(options) });
		return data.reduce((coll, guild) => coll.set(guild.id, new OAuth2Guild(this.client, guild)), new Collection());
	}

}

exports.GuildManager = GuildManager;
