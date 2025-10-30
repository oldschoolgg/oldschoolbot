'use strict';

const { Collection } = require('@discordjs/collection');
const { makeURLSearchParams } = require('@discordjs/rest');
const { isJSONEncodable } = require('@discordjs/util');
const { Routes } = require('discord-api-types/v10');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { ApplicationCommand } = require('../structures/ApplicationCommand.js');
const { PermissionsBitField } = require('../util/PermissionsBitField.js');
const { ApplicationCommandPermissionsManager } = require('./ApplicationCommandPermissionsManager.js');
const { CachedManager } = require('./CachedManager.js');

class ApplicationCommandManager extends CachedManager {
	constructor(client, iterable) {
		super(client, ApplicationCommand, iterable);
		this.permissions = new ApplicationCommandPermissionsManager(this);
	}

	_add(data, cache, guildId) {
		return super._add(data, cache, { extras: [this.guild, guildId] });
	}

	commandPath({ id, guildId } = {}) {
		if (this.guild ?? guildId) {
			if (id) {
				return Routes.applicationGuildCommand(this.client.application.id, this.guild?.id ?? guildId, id);
			}

			return Routes.applicationGuildCommands(this.client.application.id, this.guild?.id ?? guildId);
		}

		if (id) {
			return Routes.applicationCommand(this.client.application.id, id);
		}

		return Routes.applicationCommands(this.client.application.id);
	}

	async fetch(options) {
		if (!options) return this._fetchMany();

		if (typeof options === 'string') return this._fetchSingle({ id: options });

		const { cache, force, guildId, id, locale, withLocalizations } = options;

		if (id) return this._fetchSingle({ cache, force, guildId, id });

		return this._fetchMany({ cache, guildId, locale, withLocalizations });
	}

	async _fetchSingle({ cache, force = false, guildId, id }) {
		if (!force) {
			const existing = this.cache.get(id);
			if (existing) return existing;
		}

		const command = await this.client.rest.get(this.commandPath({ id, guildId }));
		return this._add(command, cache);
	}

	async _fetchMany({ cache, guildId, locale, withLocalizations } = {}) {
		const data = await this.client.rest.get(this.commandPath({ guildId }), {
			headers: {
				'X-Discord-Locale': locale,
			},
			query: makeURLSearchParams({ with_localizations: withLocalizations }),
		});

		return data.reduce((coll, command) => coll.set(command.id, this._add(command, cache, guildId)), new Collection());
	}

	async create(command, guildId) {
		const data = await this.client.rest.post(this.commandPath({ guildId }), {
			body: this.constructor.transformCommand(command),
		});
		return this._add(data, true, guildId);
	}


	async set(commands, guildId) {
		const data = await this.client.rest.put(this.commandPath({ guildId }), {
			body: commands.map(command => this.constructor.transformCommand(command)),
		});
		return data.reduce(
			(collection, command) => collection.set(command.id, this._add(command, true, guildId)),
			new Collection(),
		);
	}


	async edit(command, data, guildId) {
		const id = this.resolveId(command);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'command', 'ApplicationCommandResolvable');

		const patched = await this.client.rest.patch(this.commandPath({ id, guildId }), {
			body: this.constructor.transformCommand(data),
		});
		return this._add(patched, true, guildId);
	}

	async delete(command, guildId) {
		const id = this.resolveId(command);
		if (!id) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'command', 'ApplicationCommandResolvable');

		await this.client.rest.delete(this.commandPath({ id, guildId }));

		const cached = this.cache.get(id);
		this.cache.delete(id);
		return cached ?? null;
	}

	static transformCommand(command) {
		if (isJSONEncodable(command)) return command.toJSON();

		let default_member_permissions;

		if ('default_member_permissions' in command) {
			default_member_permissions = command.default_member_permissions
				? new PermissionsBitField(BigInt(command.default_member_permissions)).bitfield.toString()
				: command.default_member_permissions;
		}

		if ('defaultMemberPermissions' in command) {
			default_member_permissions =
				command.defaultMemberPermissions === null
					? command.defaultMemberPermissions
					: new PermissionsBitField(command.defaultMemberPermissions).bitfield.toString();
		}

		return {
			name: command.name,
			name_localizations: command.nameLocalizations ?? command.name_localizations,
			description: command.description,
			nsfw: command.nsfw,
			description_localizations: command.descriptionLocalizations ?? command.description_localizations,
			type: command.type,
			options: command.options?.map(option => ApplicationCommand.transformOption(option)),
			default_member_permissions,
			integration_types: command.integrationTypes ?? command.integration_types,
			contexts: command.contexts,
			handler: command.handler,
		};
	}
}

exports.ApplicationCommandManager = ApplicationCommandManager;
