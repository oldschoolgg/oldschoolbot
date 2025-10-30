'use strict';

const { Snowflake } = require('@sapphire/snowflake');
const { PermissionFlagsBits, ChannelType } = require('discord-api-types/v10');
const { PermissionOverwriteManager } = require('../managers/PermissionOverwriteManager.js');
const { PermissionsBitField } = require('../util/PermissionsBitField.js');
const { getSortableGroupTypes } = require('../util/Util.js');
const { BaseChannel } = require('./BaseChannel.js');

class GuildChannel extends BaseChannel {
	constructor(guild, data, client, immediatePatch = true) {
		super(client, data, false);
		this.guild = guild;
		this.guildId = guild?.id ?? data.guild_id;
		this.permissionOverwrites = new PermissionOverwriteManager(this);

		if (data && immediatePatch) this._patch(data);
	}

	_patch(data) {
		super._patch(data);

		if ('name' in data) {
			this.name = data.name;
		}

		if ('position' in data) {
			this.rawPosition = data.position;
		}

		if ('guild_id' in data) {
			this.guildId = data.guild_id;
		}

		if ('parent_id' in data) {
			this.parentId = data.parent_id;
		} else {
			this.parentId ??= null;
		}

		if ('permission_overwrites' in data) {
			this.permissionOverwrites.cache.clear();
			for (const overwrite of data.permission_overwrites) {
				this.permissionOverwrites._add(overwrite);
			}
		}
	}

	_clone() {
		const clone = super._clone();
		clone.permissionOverwrites = new PermissionOverwriteManager(clone, this.permissionOverwrites.cache.values());
		return clone;
	}

	get parent() {
		return this.guild.channels.resolve(this.parentId);
	}

	get permissionsLocked() {
		if (!this.parent) return null;

		// Get all overwrites
		const overwriteIds = new Set([
			...this.permissionOverwrites.cache.keys(),
			...this.parent.permissionOverwrites.cache.keys(),
		]);

		// Compare all overwrites
		return [...overwriteIds].every(key => {
			const channelVal = this.permissionOverwrites.cache.get(key);
			const parentVal = this.parent.permissionOverwrites.cache.get(key);

			// Handle empty overwrite
			if (
				(!channelVal &&
					parentVal.deny.bitfield === PermissionsBitField.DefaultBit &&
					parentVal.allow.bitfield === PermissionsBitField.DefaultBit) ||
				(!parentVal &&
					channelVal.deny.bitfield === PermissionsBitField.DefaultBit &&
					channelVal.allow.bitfield === PermissionsBitField.DefaultBit)
			) {
				return true;
			}

			// Compare overwrites
			return (
				channelVal !== undefined &&
				parentVal !== undefined &&
				channelVal.deny.bitfield === parentVal.deny.bitfield &&
				channelVal.allow.bitfield === parentVal.allow.bitfield
			);
		});
	}

	get position() {
		const selfIsCategory = this.type === ChannelType.GuildCategory;
		const types = getSortableGroupTypes(this.type);

		let count = 0;
		for (const channel of this.guild.channels.cache.values()) {
			if (!types.includes(channel.type)) continue;
			if (!selfIsCategory && channel.parentId !== this.parentId) continue;
			if (this.rawPosition === channel.rawPosition) {
				if (Snowflake.compare(channel.id, this.id) === -1) count++;
			} else if (this.rawPosition > channel.rawPosition) {
				count++;
			}
		}

		return count;
	}

	permissionsFor(memberOrRole, checkAdmin = true) {
		const member = this.guild.members.resolve(memberOrRole);
		if (member) return this.memberPermissions(member, checkAdmin);
		const role = this.guild.roles.resolve(memberOrRole);
		return role && this.rolePermissions(role, checkAdmin);
	}

	overwritesFor(member, verified = false, roles = null) {
		const resolvedMember = verified ? member : this.guild.members.resolve(member);
		if (!resolvedMember) return [];

		const resolvedRoles = roles ?? resolvedMember.roles.cache;
		const roleOverwrites = [];
		let memberOverwrites;
		let everyoneOverwrites;

		for (const overwrite of this.permissionOverwrites.cache.values()) {
			if (overwrite.id === this.guild.id) {
				everyoneOverwrites = overwrite;
			} else if (resolvedRoles.has(overwrite.id)) {
				roleOverwrites.push(overwrite);
			} else if (overwrite.id === resolvedMember.id) {
				memberOverwrites = overwrite;
			}
		}

		return {
			everyone: everyoneOverwrites,
			roles: roleOverwrites,
			member: memberOverwrites,
		};
	}

	memberPermissions(member, checkAdmin) {
		if (checkAdmin && member.id === this.guild.ownerId) {
			return new PermissionsBitField(PermissionsBitField.All).freeze();
		}

		const roles = member.roles.cache;
		const permissions = new PermissionsBitField(roles.map(role => role.permissions));

		if (checkAdmin && permissions.has(PermissionFlagsBits.Administrator)) {
			return new PermissionsBitField(PermissionsBitField.All).freeze();
		}

		const overwrites = this.overwritesFor(member, true, roles);

		return permissions
			.remove(overwrites.everyone?.deny ?? PermissionsBitField.DefaultBit)
			.add(overwrites.everyone?.allow ?? PermissionsBitField.DefaultBit)
			.remove(overwrites.roles.length > 0 ? overwrites.roles.map(role => role.deny) : PermissionsBitField.DefaultBit)
			.add(overwrites.roles.length > 0 ? overwrites.roles.map(role => role.allow) : PermissionsBitField.DefaultBit)
			.remove(overwrites.member?.deny ?? PermissionsBitField.DefaultBit)
			.add(overwrites.member?.allow ?? PermissionsBitField.DefaultBit)
			.freeze();
	}

	rolePermissions(role, checkAdmin) {
		if (checkAdmin && role.permissions.has(PermissionFlagsBits.Administrator)) {
			return new PermissionsBitField(PermissionsBitField.All).freeze();
		}

		const basePermissions = new PermissionsBitField([role.permissions, role.guild.roles.everyone.permissions]);
		const everyoneOverwrites = this.permissionOverwrites.cache.get(this.guild.id);
		const roleOverwrites = this.permissionOverwrites.cache.get(role.id);

		return basePermissions
			.remove(everyoneOverwrites?.deny ?? PermissionsBitField.DefaultBit)
			.add(everyoneOverwrites?.allow ?? PermissionsBitField.DefaultBit)
			.remove(roleOverwrites?.deny ?? PermissionsBitField.DefaultBit)
			.add(roleOverwrites?.allow ?? PermissionsBitField.DefaultBit)
			.freeze();
	}

	async clone(options = {}) {
		return this.guild.channels.create({
			name: options.name ?? this.name,
			permissionOverwrites: this.permissionOverwrites.cache,
			topic: this.topic,
			type: this.type,
			nsfw: this.nsfw,
			parent: this.parent,
			bitrate: this.bitrate,
			userLimit: this.userLimit,
			position: this.rawPosition,
			reason: null,
			...options,
		});
	}

	equals(channel) {
		let equal =
			channel &&
			this.id === channel.id &&
			this.type === channel.type &&
			this.topic === channel.topic &&
			this.position === channel.position &&
			this.name === channel.name;

		if (equal) {
			if (this.permissionOverwrites && channel.permissionOverwrites) {
				equal = this.permissionOverwrites.cache.equals(channel.permissionOverwrites.cache);
			} else {
				equal = !this.permissionOverwrites && !channel.permissionOverwrites;
			}
		}

		return equal;
	}

	get viewable() {
		const permissions = this.permissionsFor(this.client.user);
		if (!permissions) return false;
		return permissions.has(PermissionFlagsBits.ViewChannel, false);
	}
}

exports.GuildChannel = GuildChannel;
