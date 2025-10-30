'use strict';

const { OverwriteType } = require('discord-api-types/v10');
const { DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { PermissionsBitField } = require('../util/PermissionsBitField.js');
const { Base } = require('./Base.js');
const { Role } = require('./Role.js');

class PermissionOverwrites extends Base {
	constructor(client, data, channel) {
		super(client);

		Object.defineProperty(this, 'channel', { value: channel });

		if (data) this._patch(data);
	}

	_patch(data) {

		this.id = data.id;

		if ('type' in data) {

			this.type = data.type;
		}

		if ('deny' in data) {

			this.deny = new PermissionsBitField(BigInt(data.deny)).freeze();
		}

		if ('allow' in data) {

			this.allow = new PermissionsBitField(BigInt(data.allow)).freeze();
		}
	}

	toJSON() {
		return {
			id: this.id,
			type: this.type,
			allow: this.allow,
			deny: this.deny,
		};
	}

	static resolveOverwriteOptions(options, initialPermissions = {}) {
		const allow = new PermissionsBitField(initialPermissions.allow);
		const deny = new PermissionsBitField(initialPermissions.deny);

		for (const [perm, value] of Object.entries(options)) {
			if (value === true) {
				allow.add(perm);
				deny.remove(perm);
			} else if (value === false) {
				allow.remove(perm);
				deny.add(perm);
			} else if (value === null) {
				allow.remove(perm);
				deny.remove(perm);
			}
		}

		return { allow, deny };
	}

	static resolve(overwrite, guild) {
		if (overwrite instanceof this) return overwrite.toJSON();

		const id = guild.roles.resolveId(overwrite.id) ?? guild.client.users.resolveId(overwrite.id);
		if (!id) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'overwrite.id', 'UserResolvable or RoleResolvable');
		}

		if (overwrite.type !== undefined && (typeof overwrite.type !== 'number' || !(overwrite.type in OverwriteType))) {
			throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'overwrite.type', 'OverwriteType', true);
		}

		let type;
		if (typeof overwrite.id === 'string') {
			if (overwrite.type === undefined) {
				throw new DiscordjsTypeError(ErrorCodes.PermissionOverwritesTypeMandatory);
			}

			type = overwrite.type;
		} else {
			type = overwrite.id instanceof Role ? OverwriteType.Role : OverwriteType.Member;
			if (overwrite.type !== undefined && type !== overwrite.type) {
				throw new DiscordjsTypeError(ErrorCodes.PermissionOverwritesTypeMismatch, OverwriteType[type]);
			}
		}

		return {
			id,
			type,
			allow: PermissionsBitField.resolve(overwrite.allow ?? PermissionsBitField.DefaultBit).toString(),
			deny: PermissionsBitField.resolve(overwrite.deny ?? PermissionsBitField.DefaultBit).toString(),
		};
	}
}

exports.PermissionOverwrites = PermissionOverwrites;
