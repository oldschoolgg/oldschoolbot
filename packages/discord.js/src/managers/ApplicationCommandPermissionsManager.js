'use strict';

const { Collection } = require('@discordjs/collection');
const { ApplicationCommandPermissionType, RESTJSONErrorCodes, Routes } = require('discord-api-types/v10');
const { DiscordjsError, DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { BaseManager } = require('./BaseManager.js');

class ApplicationCommandPermissionsManager extends BaseManager {
	constructor(manager) {
		super(manager.client);

		this.manager = manager;
		this.guild = manager.guild ?? null;
		this.guildId = manager.guildId ?? manager.guild?.id ?? null;
		this.commandId = manager.id ?? null;
	}

	permissionsPath(guildId, commandId) {
		if (commandId) {
			return Routes.applicationCommandPermissions(this.client.application.id, guildId, commandId);
		}

		return Routes.guildApplicationCommandsPermissions(this.client.application.id, guildId);
	}

	async fetch({ guild, command } = {}) {
		const { guildId, commandId } = this._validateOptions(guild, command);
		if (commandId) {
			const innerData = await this.client.rest.get(this.permissionsPath(guildId, commandId));
			return innerData.permissions;
		}

		const data = await this.client.rest.get(this.permissionsPath(guildId));
		return data.reduce((coll, perm) => coll.set(perm.id, perm.permissions), new Collection());
	}

	async set({ guild, command, permissions, token } = {}) {
		if (!token) {
			throw new DiscordjsError(ErrorCodes.ApplicationCommandPermissionsTokenMissing);
		}

		const options = this._validateOptions(guild, command);
		let { commandId } = options;

		if (!Array.isArray(permissions)) {
			throw new DiscordjsTypeError(
				ErrorCodes.InvalidType,
				'permissions',
				'Array of ApplicationCommandPermissions',
				true,
			);
		}

		commandId ??= this.client.user.id;

		const data = await this.client.rest.put(this.permissionsPath(options.guildId, commandId), {
			body: { permissions },
			auth: false,
			headers: { Authorization: `Bearer ${token}` },
		});
		return data.permissions;
	}

	async add({ guild, command, permissions, token } = {}) {
		if (!token) {
			throw new DiscordjsError(ErrorCodes.ApplicationCommandPermissionsTokenMissing);
		}

		const options = this._validateOptions(guild, command);
		let { commandId } = options;
		commandId ??= this.client.user.id;

		if (!Array.isArray(permissions)) {
			throw new DiscordjsTypeError(
				ErrorCodes.InvalidType,
				'permissions',
				'Array of ApplicationCommandPermissions',
				true,
			);
		}

		let existingPermissions = [];
		try {
			existingPermissions = await this.fetch({ guild: options.guildId, command: commandId });
		} catch (error) {
			if (error.code !== RESTJSONErrorCodes.UnknownApplicationCommandPermissions) throw error;
		}

		const newPermissions = permissions.slice();
		for (const existingPermission of existingPermissions) {
			if (!newPermissions.some(newPermission => newPermission.id === existingPermission.id)) {
				newPermissions.push(existingPermission);
			}
		}

		return this.set({ guild: options.guildId, command: commandId, permissions: newPermissions, token });
	}

	async remove({ guild, command, users, roles, channels, token } = {}) {
		if (!token) {
			throw new DiscordjsError(ErrorCodes.ApplicationCommandPermissionsTokenMissing);
		}

		const options = this._validateOptions(guild, command);
		let { commandId } = options;
		commandId ??= this.client.user.id;

		if (!users && !roles && !channels) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'users OR roles OR channels', 'Array or Resolvable', true);
		}

		const resolvedUserIds = [];
		if (Array.isArray(users)) {
			for (const user of users) {
				const userId = this.client.users.resolveId(user);
				if (!userId) throw new DiscordjsTypeError(ErrorCodes.InvalidElement, 'Array', 'users', user);
				resolvedUserIds.push(userId);
			}
		}

		const resolvedRoleIds = [];
		if (Array.isArray(roles)) {
			for (const role of roles) {
				if (typeof role === 'string') {
					resolvedRoleIds.push(role);
					continue;
				}

				if (!this.guild) throw new DiscordjsError(ErrorCodes.GuildUncachedEntityResolve, 'roles');
				const roleId = this.guild.roles.resolveId(role);
				if (!roleId) throw new DiscordjsTypeError(ErrorCodes.InvalidElement, 'Array', 'users', role);
				resolvedRoleIds.push(roleId);
			}
		}

		const resolvedChannelIds = [];
		if (Array.isArray(channels)) {
			for (const channel of channels) {
				if (typeof channel === 'string') {
					resolvedChannelIds.push(channel);
					continue;
				}

				if (!this.guild) throw new DiscordjsError(ErrorCodes.GuildUncachedEntityResolve, 'channels');
				const channelId = this.guild.channels.resolveId(channel);
				if (!channelId) throw new DiscordjsTypeError(ErrorCodes.InvalidElement, 'Array', 'channels', channel);
				resolvedChannelIds.push(channelId);
			}
		}

		let existing = [];
		try {
			existing = await this.fetch({ guild: options.guildId, command: commandId });
		} catch (error) {
			if (error.code !== RESTJSONErrorCodes.UnknownApplicationCommandPermissions) throw error;
		}

		const permissions = existing.filter(perm => {
			switch (perm.type) {
				case ApplicationCommandPermissionType.Role:
					return !resolvedRoleIds.includes(perm.id);
				case ApplicationCommandPermissionType.User:
					return !resolvedUserIds.includes(perm.id);
				case ApplicationCommandPermissionType.Channel:
					return !resolvedChannelIds.includes(perm.id);
				default:
					return true;
			}
		});

		return this.set({ guild: options.guildId, command: commandId, permissions, token });
	}

	async has({ guild, command, permissionId, permissionType }) {
		const { guildId, commandId } = this._validateOptions(guild, command);
		if (!commandId) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'command', 'ApplicationCommandResolvable');

		if (!permissionId) {
			throw new DiscordjsTypeError(
				ErrorCodes.InvalidType,
				'permissionId',
				'UserResolvable, RoleResolvable, ChannelResolvable, or Permission Constant',
			);
		}

		let resolvedId = permissionId;
		if (typeof permissionId !== 'string') {
			resolvedId = this.client.users.resolveId(permissionId);
			if (!resolvedId) {
				if (!this.guild) throw new DiscordjsError(ErrorCodes.GuildUncachedEntityResolve, 'roles');
				resolvedId = this.guild.roles.resolveId(permissionId);
			}

			resolvedId ??= this.guild.channels.resolveId(permissionId);

			if (!resolvedId) {
				throw new DiscordjsTypeError(
					ErrorCodes.InvalidType,
					'permissionId',
					'UserResolvable, RoleResolvable, ChannelResolvable, or Permission Constant',
				);
			}
		}

		let existing = [];
		try {
			existing = await this.fetch({ guild: guildId, command: commandId });
		} catch (error) {
			if (error.code !== RESTJSONErrorCodes.UnknownApplicationCommandPermissions) throw error;
		}

		// Check permission type if provided for the single edge case where a channel id is the same as the everyone role id
		return existing.some(perm => perm.id === resolvedId && (permissionType ?? perm.type) === perm.type);
	}

	_validateOptions(guild, command) {
		const guildId = this.guildId ?? this.client.guilds.resolveId(guild);
		if (!guildId) throw new DiscordjsError(ErrorCodes.GlobalCommandPermissions);
		let commandId = this.commandId;
		if (command && !commandId) {
			commandId = this.manager.resolveId?.(command);
			if (!commandId && this.guild) {
				commandId = this.guild.commands.resolveId(command);
			}

			commandId ??= this.client.application?.commands.resolveId(command);
			if (!commandId) {
				throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'command', 'ApplicationCommandResolvable', true);
			}
		}

		return { guildId, commandId };
	}
}

exports.ApplicationCommandPermissionsManager = ApplicationCommandPermissionsManager;
