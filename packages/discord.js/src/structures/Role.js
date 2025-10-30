'use strict';

const { roleMention } = require('@discordjs/formatters');
const { DiscordSnowflake } = require('@sapphire/snowflake');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { DiscordjsError, ErrorCodes } = require('../errors/index.js');
const { PermissionsBitField } = require('../util/PermissionsBitField.js');
const { RoleFlagsBitField } = require('../util/RoleFlagsBitField.js');
const { Base } = require('./Base.js');

/**
 * Represents a role on Discord.
 *
 * @extends {Base}
 */
class Role extends Base {
	constructor(client, data, guild) {
		super(client);

		/**
		 * The guild that the role belongs to
		 *
		 * @type {Guild}
		 */
		this.guild = guild;

		/**
		 * The icon hash of the role
		 *
		 * @type {?string}
		 */
		this.icon = null;

		/**
		 * The unicode emoji for the role
		 *
		 * @type {?string}
		 */
		this.unicodeEmoji = null;

		if (data) this._patch(data);
	}

	_patch(data) {
		/**
		 * The role's id (unique to the guild it is part of)
		 *
		 * @type {Snowflake}
		 */
		this.id = data.id;
		if ('name' in data) {
			/**
			 * The name of the role
			 *
			 * @type {string}
			 */
			this.name = data.name;
		}

		/**
		 * @typedef {Object} RoleColors
		 * @property {number} primaryColor The primary color of the role
		 * @property {?number} secondaryColor The secondary color of the role.
		 * This will make the role a gradient between the other provided colors
		 * @property {?number} tertiaryColor The tertiary color of the role.
		 * When sending `tertiaryColor` the API enforces the role color to be a holographic style with values of `primaryColor = 11127295`, `secondaryColor = 16759788`, and `tertiaryColor = 16761760`.
		 * These values are available as a constant: `Constants.HolographicStyle`
		 */

		if ('colors' in data) {
			/**
			 * The colors of the role
			 *
			 * @type {RoleColors}
			 */
			this.colors = {
				primaryColor: data.colors.primary_color,
				secondaryColor: data.colors.secondary_color,
				tertiaryColor: data.colors.tertiary_color,
			};
		}

		if ('hoist' in data) {
			/**
			 * If true, users that are part of this role will appear in a separate category in the users list
			 *
			 * @type {boolean}
			 */
			this.hoist = data.hoist;
		}

		if ('position' in data) {
			/**
			 * The raw position of the role from the API
			 *
			 * @type {number}
			 */
			this.rawPosition = data.position;
		}

		if ('permissions' in data) {
			/**
			 * The permissions of the role
			 *
			 * @type {Readonly<PermissionsBitField>}
			 */
			this.permissions = new PermissionsBitField(BigInt(data.permissions)).freeze();
		}

		if ('managed' in data) {
			/**
			 * Whether or not the role is managed by an external service
			 *
			 * @type {boolean}
			 */
			this.managed = data.managed;
		}

		if ('mentionable' in data) {
			/**
			 * Whether or not the role can be mentioned by anyone
			 *
			 * @type {boolean}
			 */
			this.mentionable = data.mentionable;
		}

		if ('icon' in data) this.icon = data.icon;

		if ('unicode_emoji' in data) this.unicodeEmoji = data.unicode_emoji;

		if ('flags' in data) {
			/**
			 * The flags of this role
			 *
			 * @type {Readonly<RoleFlagsBitField>}
			 */
			this.flags = new RoleFlagsBitField(data.flags).freeze();
		} else {
			this.flags ??= new RoleFlagsBitField().freeze();
		}

		/**
		 * The tags this role has
		 *
		 * @type {?Object}
		 * @property {Snowflake} [botId] The id of the bot this role belongs to
		 * @property {Snowflake|string} [integrationId] The id of the integration this role belongs to
		 * @property {true} [premiumSubscriberRole] Whether this is the guild's premium subscription role
		 * @property {Snowflake} [subscriptionListingId] The id of this role's subscription SKU and listing
		 * @property {true} [availableForPurchase] Whether this role is available for purchase
		 * @property {true} [guildConnections] Whether this role is a guild's linked role
		 */
		this.tags = data.tags ? {} : null;
		if (data.tags) {
			if ('bot_id' in data.tags) {
				this.tags.botId = data.tags.bot_id;
			}

			if ('integration_id' in data.tags) {
				this.tags.integrationId = data.tags.integration_id;
			}

			if ('premium_subscriber' in data.tags) {
				this.tags.premiumSubscriberRole = true;
			}

			if ('guild_connections' in data.tags) {
				this.tags.guildConnections = true;
			}
		}
	}

	/**
	 * The timestamp the role was created at
	 *
	 * @type {number}
	 * @readonly
	 */
	get createdTimestamp() {
		return DiscordSnowflake.timestampFrom(this.id);
	}

	/**
	 * The time the role was created at
	 *
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return new Date(this.createdTimestamp);
	}

	/**
	 * The hexadecimal version of the role color, with a leading hashtag
	 *
	 * @type {string}
	 * @readonly
	 */
	get hexColor() {
		return `#${this.colors.primaryColor.toString(16).padStart(6, '0')}`;
	}

	get editable() {
		if (this.managed) return false;
		const clientMember = this.guild.members.resolve(this.client.user);
		if (!clientMember.permissions.has(PermissionFlagsBits.ManageRoles)) return false;
		return clientMember.roles.highest.comparePositionTo(this) > 0;
	}

	get position() {
		return this.guild.roles.cache.reduce(
			(acc, role) =>
				acc +
				(this.rawPosition === role.rawPosition
					? BigInt(this.id) < BigInt(role.id)
					: this.rawPosition > role.rawPosition),
			0,
		);
	}

	comparePositionTo(role) {
		return this.guild.roles.comparePositions(this, role);
	}

	async edit(options) {
		return this.guild.roles.edit(this, options);
	}

	permissionsIn(channel, checkAdmin = true) {
		const resolvedChannel = this.guild.channels.resolve(channel);
		if (!resolvedChannel) throw new DiscordjsError(ErrorCodes.GuildChannelResolve);
		return resolvedChannel.rolePermissions(this, checkAdmin);
	}

	/**
	 * Whether this role equals another role. It compares all properties, so for most operations
	 * it is advisable to just compare `role.id === role2.id` as it is much faster and is often
	 * what most users need.
	 *
	 * @param {Role} role Role to compare with
	 * @returns {boolean}
	 */
	equals(role) {
		return (
			role &&
			this.id === role.id &&
			this.name === role.name &&
			this.colors.primaryColor === role.colors.primaryColor &&
			this.colors.secondaryColor === role.colors.secondaryColor &&
			this.colors.tertiaryColor === role.colors.tertiaryColor &&
			this.hoist === role.hoist &&
			this.position === role.position &&
			this.permissions.bitfield === role.permissions.bitfield &&
			this.managed === role.managed &&
			this.icon === role.icon &&
			this.unicodeEmoji === role.unicodeEmoji
		);
	}

	/**
	 * When concatenated with a string, this automatically returns the role's mention instead of the Role object.
	 *
	 * @returns {string}
	 * @example
	 * // Logs: Role: <@&123456789012345678>
	 * console.log(`Role: ${role}`);
	 */
	toString() {
		if (this.id === this.guild.id) return '@everyone';
		return roleMention(this.id);
	}

	toJSON() {
		return {
			...super.toJSON({ createdTimestamp: true }),
			permissions: this.permissions.toJSON(),
		};
	}
}

exports.Role = Role;
