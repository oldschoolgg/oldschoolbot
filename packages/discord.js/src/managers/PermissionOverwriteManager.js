'use strict';

const { Collection } = require('@discordjs/collection');
const { OverwriteType, Routes } = require('discord-api-types/v10');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { PermissionOverwrites } = require('../structures/PermissionOverwrites.js');
const { Role } = require('../structures/Role.js');
const { CachedManager } = require('./CachedManager.js');

class PermissionOverwriteManager extends CachedManager {
	constructor(channel, iterable) {
		super(channel.client, PermissionOverwrites);
		this.channel = channel;

		if (iterable) {
			for (const item of iterable) {
				this._add(item);
			}
		}
	}


	_add(data, cache) {
		return super._add(data, cache, { extras: [this.channel] });
	}

	async set(overwrites, reason) {
		if (!Array.isArray(overwrites) && !(overwrites instanceof Collection)) {
			throw new DiscordjsTypeError(
				ErrorCodes.InvalidType,
				'overwrites',
				'Array or Collection of Permission Overwrites',
				true,
			);
		}

		return this.channel.edit({ permissionOverwrites: overwrites, reason });
	}

	async upsert(userOrRole, options, { reason, type } = {}, existing = undefined) {
		const userOrRoleId = this.channel.guild.roles.resolveId(userOrRole) ?? this.client.users.resolveId(userOrRole);

		let resolvedType = type;
		if (typeof resolvedType !== 'number') {
			const resolvedUserOrRole = this.channel.guild.roles.resolve(userOrRole) ?? this.client.users.resolve(userOrRole);
			if (!resolvedUserOrRole) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'parameter', 'User nor a Role');
			resolvedType = resolvedUserOrRole instanceof Role ? OverwriteType.Role : OverwriteType.Member;
		}

		const { allow, deny } = PermissionOverwrites.resolveOverwriteOptions(options, existing);

		await this.client.rest.put(Routes.channelPermission(this.channel.id, userOrRoleId), {
			body: { id: userOrRoleId, type: resolvedType, allow, deny },
			reason,
		});
		return this.channel;
	}

	async create(userOrRole, options, overwriteOptions) {
		return this.upsert(userOrRole, options, overwriteOptions);
	}

	async edit(userOrRole, options, overwriteOptions) {
		const existing = this.cache.get(
			this.channel.guild.roles.resolveId(userOrRole) ?? this.client.users.resolveId(userOrRole),
		);
		return this.upsert(userOrRole, options, overwriteOptions, existing);
	}

	async delete(userOrRole, reason) {
		const userOrRoleId = this.channel.guild.roles.resolveId(userOrRole) ?? this.client.users.resolveId(userOrRole);
		if (!userOrRoleId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'parameter', 'User nor a Role');

		await this.client.rest.delete(Routes.channelPermission(this.channel.id, userOrRoleId), { reason });
		return this.channel;
	}
}

exports.PermissionOverwriteManager = PermissionOverwriteManager;
