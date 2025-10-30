'use strict';

const { Routes } = require('discord-api-types/v10');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { Role } = require('../structures/Role.js');
const { resolveImage } = require('../util/DataResolver.js');
const { GuildMemberFlagsBitField } = require('../util/GuildMemberFlagsBitField.js');
const { Partials } = require('../util/Partials.js');

class GuildMemberManager {

	constructor(guild) {
		this.guild = guild;
		this.cache = new Map();
	}

	_add(data) {
		this.cache.set(data.user.id, data);
	}

	resolve(member) {
		const memberResolvable = super.resolve(member);
		if (memberResolvable) return memberResolvable;
		const userResolvable = this.client.users.resolveId(member);
		if (userResolvable) return super.cache.get(userResolvable) ?? null;
		return null;
	}

	resolveId(member) {
		const memberResolvable = super.resolveId(member);
		if (memberResolvable) return memberResolvable;
		const userResolvable = this.client.users.resolveId(member);
		return this.cache.has(userResolvable) ? userResolvable : null;
	}

	get me() {
		return (
			this.cache.get(this.client.user.id) ??
			(this.client.options.partials.includes(Partials.GuildMember)
				? this._add({ user: { id: this.client.user.id } }, true)
				: null)
		);
	}

	async fetch(options) {
		if (!options) return this._fetchMany();
		const withPresences = false;
		const { user: users, limit, cache, force } = options;
		const resolvedUser = this.client.users.resolveId(users ?? options);
		if (resolvedUser && !limit && !withPresences) return this._fetchSingle({ user: resolvedUser, cache, force });
		const resolvedUsers = users?.map?.(user => this.client.users.resolveId(user)) ?? resolvedUser ?? undefined;
		return this._fetchMany({ ...options, users: resolvedUsers });
	}

	async _fetchSingle({ user, cache, force = false }) {
		if (!force) {
			const existing = this.cache.get(user);
			if (existing && !existing.partial) return existing;
		}

		const data = await this.client.rest.get(Routes.guildMember(this.guild.id, user));
		return this._add(data, cache);
	}

	async fetchMe(options) {
		return this.fetch({ ...options, user: this.client.user.id });
	}

	async edit(user, { reason, ...options }) {
		const id = this.client.users.resolveId(user);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'user', 'UserResolvable');

		options.roles &&= options.roles.map(role => (role instanceof Role ? role.id : role));

		if (options.flags !== undefined) {
			options.flags = GuildMemberFlagsBitField.resolve(options.flags);
		}

		const data = await this.client.rest.patch(Routes.guildMember(this.guild.id, id), { body: options, reason });
		const clone = this.cache.get(id)?._clone();
		clone?._patch(data);
		return clone ?? this._add(data, false);
	}

	async editMe({ reason, ...options }) {
		const data = await this.client.rest.patch(Routes.guildMember(this.guild.id, '@me'), {
			body: {
				...options,
				banner: options.banner && (await resolveImage(options.banner)),
				avatar: options.avatar && (await resolveImage(options.avatar)),
			},
			reason,
		});

		const clone = this.me?._clone();
		clone?._patch(data);
		return clone ?? this._add(data, false);
	}

	async addRole(options) {
		const { user, role, reason } = options;
		const userId = this.resolveId(user);
		const roleId = this.guild.roles.resolveId(role);
		await this.client.rest.put(Routes.guildMemberRole(this.guild.id, userId, roleId), { reason });
	}

	async removeRole(options) {
		const { user, role, reason } = options;
		const userId = this.resolveId(user);
		const roleId = this.guild.roles.resolveId(role);
		await this.client.rest.delete(Routes.guildMemberRole(this.guild.id, userId, roleId), { reason });
	}
}

exports.GuildMemberManager = GuildMemberManager;
