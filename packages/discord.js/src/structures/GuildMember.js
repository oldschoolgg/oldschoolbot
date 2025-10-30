'use strict';

const { PermissionFlagsBits } = require('discord-api-types/v10');
const { DiscordjsError, ErrorCodes } = require('../errors/index.js');
const { GuildMemberRoleManager } = require('../managers/GuildMemberRoleManager.js');
const { GuildMemberFlagsBitField } = require('../util/GuildMemberFlagsBitField.js');
const { PermissionsBitField } = require('../util/PermissionsBitField.js');
const { Base } = require('./Base.js');

/**
 * Represents a member of a guild on Discord.
 *
 * @extends {Base}
 */
class GuildMember extends Base {
	constructor(client, data, guild) {
		super(client);

		/**
		 * The guild that this member is part of
		 *
		 * @type {Guild}
		 */
		this.guild = guild;

		/**
		 * The timestamp the member joined the guild at
		 *
		 * @type {?number}
		 */
		this.joinedTimestamp = null;

		/**
		 * The last timestamp this member started boosting the guild
		 *
		 * @type {?number}
		 */
		this.premiumSinceTimestamp = null;

		/**
		 * The nickname of this member, if they have one
		 *
		 * @type {?string}
		 */
		this.nickname = null;

		/**
		 * The role ids of the member
		 *
		 * @name GuildMember#_roles
		 * @type {Snowflake[]}
		 * @private
		 */
		Object.defineProperty(this, '_roles', { value: [], writable: true });

		if (data) this._patch(data);
	}

	_patch(data) {
		if ('user' in data) {
			/**
			 * The user that this guild member instance represents
			 *
			 * @type {?User}
			 */
			this.user = this.client.users._add(data.user, true);
		}

		if ('nick' in data) this.nickname = data.nick;
		if ('avatar' in data) {
			/**
			 * The guild member's avatar hash
			 *
			 * @type {?string}
			 */
			this.avatar = data.avatar;
		} else if (typeof this.avatar !== 'string') {
			this.avatar = null;
		}

		if ('joined_at' in data) this.joinedTimestamp = Date.parse(data.joined_at);
		if ('premium_since' in data) {
			this.premiumSinceTimestamp = data.premium_since ? Date.parse(data.premium_since) : null;
		}

		if ('roles' in data) this._roles = data.roles;

		if ('pending' in data) {
			this.pending = data.pending;
		} else if (!this.partial) {
			// See https://github.com/discordjs/discord.js/issues/6546 for more info.
			this.pending ??= false;
		}

		if ('flags' in data) {
			/**
			 * The flags of this member
			 *
			 * @type {Readonly<GuildMemberFlagsBitField>}
			 */
			this.flags = new GuildMemberFlagsBitField(data.flags).freeze();
		} else {
			this.flags ??= new GuildMemberFlagsBitField().freeze();
		}

	}

	_clone() {
		const clone = super._clone();
		clone._roles = this._roles.slice();
		return clone;
	}

	/**
	 * Whether this GuildMember is a partial
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get partial() {
		return this.joinedTimestamp === null;
	}

	/**
	 * A manager for the roles belonging to this member
	 *
	 * @type {GuildMemberRoleManager}
	 * @readonly
	 */
	get roles() {
		return new GuildMemberRoleManager(this);
	}

	/**
	 * A link to the member's guild avatar.
	 *
	 * @param {ImageURLOptions} [options={}] Options for the image URL
	 * @returns {?string}
	 */
	avatarURL(options = {}) {
		return this.avatar && this.client.rest.cdn.guildMemberAvatar(this.guild.id, this.id, this.avatar, options);
	}

	/**
	 * A link to the member's guild avatar if they have one.
	 * Otherwise, a link to their {@link User#displayAvatarURL} will be returned.
	 *
	 * @param {ImageURLOptions} [options={}] Options for the image URL
	 * @returns {string}
	 */
	displayAvatarURL(options) {
		return this.avatarURL(options) ?? this.user.displayAvatarURL(options);
	}

	/**
	 * The time this member joined the guild
	 *
	 * @type {?Date}
	 * @readonly
	 */
	get joinedAt() {
		return this.joinedTimestamp && new Date(this.joinedTimestamp);
	}

	/**
	 * The displayed role color of this member in base 10
	 *
	 * @type {number}
	 * @readonly
	 */
	get displayColor() {
		return this.roles.color?.colors.primaryColor ?? 0;
	}

	/**
	 * The displayed role color of this member in hexadecimal
	 *
	 * @type {string}
	 * @readonly
	 */
	get displayHexColor() {
		return this.roles.color?.hexColor ?? '#000000';
	}

	/**
	 * The member's id
	 *
	 * @type {Snowflake}
	 * @readonly
	 */
	get id() {
		return this.user.id;
	}

	/**
	 * The DM between the client's user and this member
	 *
	 * @type {?DMChannel}
	 * @readonly
	 */
	get dmChannel() {
		return this.client.users.dmChannel(this.id);
	}

	/**
	 * The nickname of this member, or their user display name if they don't have one
	 *
	 * @type {?string}
	 * @readonly
	 */
	get displayName() {
		return this.nickname ?? this.user.displayName;
	}

	/**
	 * The overall set of permissions for this member, taking only roles and owner status into account
	 *
	 * @type {Readonly<PermissionsBitField>}
	 * @readonly
	 */
	get permissions() {
		if (this.user.id === this.guild.ownerId) return new PermissionsBitField(PermissionsBitField.All).freeze();
		return new PermissionsBitField(this.roles.cache.map(role => role.permissions)).freeze();
	}

	/**
	 * Whether this member is currently timed out
	 *
	 * @returns {boolean}
	 */
	isCommunicationDisabled() {
		return this.communicationDisabledUntilTimestamp > Date.now();
	}

	/**
	 * Returns `channel.permissionsFor(guildMember)`. Returns permissions for a member in a guild channel,
	 * taking into account roles and permission overwrites.
	 *
	 * @param {GuildChannelResolvable} channel The guild channel to use as context
	 * @returns {Readonly<PermissionsBitField>}
	 */
	permissionsIn(channel) {
		const resolvedChannel = this.guild.channels.resolve(channel);
		if (!resolvedChannel) throw new DiscordjsError(ErrorCodes.GuildChannelResolve);
		return resolvedChannel.permissionsFor(this);
	}

	async createDM(force = false) {
		return this.user.createDM(force);
	}

	/**
	 * Deletes any DMs with this member.
	 *
	 * @returns {Promise<DMChannel>}
	 */
	async deleteDM() {
		return this.user.deleteDM();
	}

	async send(options) {
		const dmChannel = await this.createDM();

		return this.client.channels.createMessage(dmChannel, options);
	}

	equals(member) {
		return (
			member instanceof this.constructor &&
			this.id === member.id &&
			this.partial === member.partial &&
			this.guild.id === member.guild.id &&
			this.joinedTimestamp === member.joinedTimestamp &&
			this.nickname === member.nickname &&
			this.avatar === member.avatar &&
			this.banner === member.banner &&
			this.pending === member.pending &&
			this.communicationDisabledUntilTimestamp === member.communicationDisabledUntilTimestamp &&
			this.flags.bitfield === member.flags.bitfield &&
			(this._roles === member._roles ||
				(this._roles.length === member._roles.length &&
					this._roles.every((role, index) => role === member._roles[index])))
		);
	}

	/**
	 * When concatenated with a string, this automatically returns the user's mention instead of the GuildMember object.
	 *
	 * @returns {string}
	 * @example
	 * // Logs: Hello from <@123456789012345678>!
	 * console.log(`Hello from ${member}!`);
	 */
	toString() {
		return this.user.toString();
	}

	toJSON() {
		const json = super.toJSON({
			guild: 'guildId',
			user: 'userId',
			displayName: true,
			roles: true,
		});
		json.avatarURL = this.avatarURL();
		json.displayAvatarURL = this.displayAvatarURL();
		return json;
	}
}

exports.GuildMember = GuildMember;
