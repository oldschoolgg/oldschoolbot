'use strict';

const { Collection } = require('@discordjs/collection');
const { ChannelType, GuildPremiumTier, Routes, GuildFeature } = require('discord-api-types/v10');
const { DiscordjsError, DiscordjsTypeError, ErrorCodes } = require('../errors/index.js');
const { GuildApplicationCommandManager } = require('../managers/GuildApplicationCommandManager.js');
const { GuildChannelManager } = require('../managers/GuildChannelManager.js');
const { GuildMemberManager } = require('../managers/GuildMemberManager.js');
const { RoleManager } = require('../managers/RoleManager.js');
const { resolveImage } = require('../util/DataResolver.js');
const { SystemChannelFlagsBitField } = require('../util/SystemChannelFlagsBitField.js');
const { discordSort, getSortableGroupTypes } = require('../util/Util.js');
const { AnonymousGuild } = require('./AnonymousGuild.js');
const { Webhook } = require('./Webhook.js');

/**
 * Represents a guild (or a server) on Discord.
 * <info>It's recommended to see if a guild is available before performing operations or reading data from it. You can
 * check this with {@link Guild#available}.</info>
 *
 * @extends {AnonymousGuild}
 */
class Guild extends AnonymousGuild {
	constructor(client, data) {
		super(client, data, false);
		this.commands = new GuildApplicationCommandManager(this);
		this.channels = new GuildChannelManager(this);
		this.roles = new RoleManager(this);

		if (!data) return;
		if (data.unavailable) {
			this.available = false;
		} else {
			this._patch(data);
			if (!data.channels) this.available = false;
		}
		this.shardId = data.shardId;
	}

	_patch(data) {
		super._patch(data);
		this.id = data.id;
		if ('name' in data) this.name = data.name;
		if ('icon' in data) this.icon = data.icon;
		if ('unavailable' in data) {
			this.available = !data.unavailable;
		} else {
			this.available ??= true;
		}

		if ('member_count' in data) {
			this.memberCount = data.member_count;
		}

		if ('large' in data) {
			this.large = Boolean(data.large);
		}

		if ('application_id' in data) {
			/**
			 * The id of the application that created this guild (if applicable)
			 *
			 * @type {?Snowflake}
			 */
			this.applicationId = data.application_id;
		}

		if ('system_channel_id' in data) {
			/**
			 * The system channel's id
			 *
			 * @type {?Snowflake}
			 */
			this.systemChannelId = data.system_channel_id;
		}

		if ('explicit_content_filter' in data) {
			/**
			 * The explicit content filter level of the guild
			 *
			 * @type {GuildExplicitContentFilter}
			 */
			this.explicitContentFilter = data.explicit_content_filter;
		}
		if ('joined_at' in data) {
			/**
			 * The timestamp the client user joined the guild at
			 *
			 * @type {number}
			 */
			this.joinedTimestamp = Date.parse(data.joined_at);
		}

		if ('system_channel_flags' in data) {
			/**
			 * The value set for the guild's system channel flags
			 *
			 * @type {Readonly<SystemChannelFlagsBitField>}
			 */
			this.systemChannelFlags = new SystemChannelFlagsBitField(data.system_channel_flags).freeze();
		}

		if (data.channels) {
			this.channels.cache.clear();
			for (const rawChannel of data.channels) {
				this.client.channels._add(rawChannel, this);
			}
		}

		if (data.threads) {
			for (const rawThread of data.threads) {
				this.client.channels._add(rawThread, this);
			}
		}

		if (data.roles) {
			this.roles.cache.clear();
			for (const role of data.roles) this.roles._add(role);
		}

		if ('owner_id' in data) {
			/**
			 * The user id of this guild's owner
			 *
			 * @type {Snowflake}
			 */
			this.ownerId = data.owner_id;
		}
	}

	get joinedAt() {
		return new Date(this.joinedTimestamp);
	}

	get systemChannel() {
		return this.client.channels.resolve(this.systemChannelId);
	}

	async fetchWebhooks() {
		const apiHooks = await this.client.rest.get(Routes.guildWebhooks(this.id));
		const hooks = new Collection();
		for (const hook of apiHooks) hooks.set(hook.id, new Webhook(this.client, hook));
		return hooks;
	}

	async edit({
		verificationLevel,
		defaultMessageNotifications,
		explicitContentFilter,
		afkChannel,
		afkTimeout,
		icon,
		banner,
		systemChannel,
		systemChannelFlags,
		rulesChannel,
		publicUpdatesChannel,
		preferredLocale,
		safetyAlertsChannel,
		...options
	}) {
		const data = await this.client.rest.patch(Routes.guild(this.id), {
			body: {
				...options,
				verification_level: verificationLevel,
				default_message_notifications: defaultMessageNotifications,
				explicit_content_filter: explicitContentFilter,
				icon: icon && (await resolveImage(icon)),
				banner: banner && (await resolveImage(banner)),
				system_channel_id: systemChannel && this.client.channels.resolveId(systemChannel),
				system_channel_flags:
					systemChannelFlags === undefined ? undefined : SystemChannelFlagsBitField.resolve(systemChannelFlags),
				rules_channel_id: rulesChannel && this.client.channels.resolveId(rulesChannel),
				public_updates_channel_id: publicUpdatesChannel && this.client.channels.resolveId(publicUpdatesChannel),
				preferred_locale: preferredLocale,
				safety_alerts_channel_id: safetyAlertsChannel && this.client.channels.resolveId(safetyAlertsChannel),
			},
			reason: options.reason,
		});

		return this.client.actions.GuildUpdate.handle(data).updated;
	}

	/**
	 * Leaves the guild.
	 *
	 * @returns {Promise<Guild>}
	 * @example
	 * // Leave a guild
	 * guild.leave()
	 *   .then(guild => console.log(`Left the guild: ${guild.name}`))
	 *   .catch(console.error);
	 */
	async leave() {
		await this.client.rest.delete(Routes.userGuild(this.id));
		return this;
	}

	/**
	 * Whether this guild equals another guild. It compares all properties, so for most operations
	 * it is advisable to just compare `guild.id === guild2.id` as it is much faster and is often
	 * what most users need.
	 *
	 * @param {Guild} guild The guild to compare with
	 * @returns {boolean}
	 */
	equals(guild) {
		return (
			guild &&
			guild instanceof this.constructor &&
			this.id === guild.id &&
			this.available === guild.available &&
			this.name === guild.name &&
			this.memberCount === guild.memberCount &&
			this.large === guild.large &&
			this.icon === guild.icon &&
			this.ownerId === guild.ownerId &&
			this.verificationLevel === guild.verificationLevel &&
			(this.features === guild.features ||
				(this.features.length === guild.features.length &&
					this.features.every((feat, index) => feat === guild.features[index])))
		);
	}

	toJSON() {
		const json = super.toJSON({
			available: false,
			createdTimestamp: true,
			nameAcronym: true,
		});
		json.iconURL = this.iconURL();
		return json;
	}

	/**
	 * Creates a collection of this guild's roles, sorted by their position and ids.
	 *
	 * @returns {Collection<Snowflake, Role>}
	 * @private
	 */
	_sortedRoles() {
		return discordSort(this.roles.cache);
	}

	/**
	 * Creates a collection of this guild's or a specific category's channels, sorted by their position and ids.
	 *
	 * @param {GuildChannel} [channel] Category to get the channels of
	 * @returns {Collection<Snowflake, GuildChannel>}
	 * @private
	 */
	_sortedChannels(channel) {
		const channelIsCategory = channel.type === ChannelType.GuildCategory;
		const types = getSortableGroupTypes(channel.type);
		return discordSort(
			this.channels.cache.filter(
				({ parentId, type }) => types.includes(type) && (channelIsCategory || parentId === channel.parentId),
			),
		);
	}
}

exports.Guild = Guild;
