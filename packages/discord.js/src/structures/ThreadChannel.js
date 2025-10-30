'use strict';

const { ChannelType, PermissionFlagsBits, Routes } = require('discord-api-types/v10');
const { GuildMessageManager } = require('../managers/GuildMessageManager.js');
const { ThreadMemberManager } = require('../managers/ThreadMemberManager.js');
const { ChannelFlagsBitField } = require('../util/ChannelFlagsBitField.js');
const { BaseChannel } = require('./BaseChannel.js');
const { TextBasedChannel } = require('./interfaces/TextBasedChannel.js');

/**
 * Represents a thread channel on Discord.
 *
 * @extends {BaseChannel}
 * @implements {TextBasedChannel}
 */
class ThreadChannel extends BaseChannel {
	constructor(guild, data, client) {
		super(guild?.client ?? client, data, false);

		/**
		 * The guild the thread is in
		 *
		 * @type {Guild}
		 */
		this.guild = guild;

		/**
		 * The id of the guild the channel is in
		 *
		 * @type {Snowflake}
		 */
		this.guildId = guild?.id ?? data.guild_id;

		/**
		 * The id of the member who created this thread
		 *
		 * @type {Snowflake}
		 */
		this.ownerId = data.owner_id;

		/**
		 * A manager of the messages sent to this thread
		 *
		 * @type {GuildMessageManager}
		 */
		this.messages = new GuildMessageManager(this);


		this.members = new ThreadMemberManager(this);
		if (data) this._patch(data);
	}

	_patch(data) {
		super._patch(data);

		if ('message' in data) this.messages._add(data.message);

		if ('name' in data) {
			/**
			 * The name of the thread
			 *
			 * @type {string}
			 */
			this.name = data.name;
		}

		if ('guild_id' in data) {
			this.guildId = data.guild_id;
		}

		if ('parent_id' in data) {
			/**
			 * The id of the parent channel of this thread
			 *
			 * @type {?Snowflake}
			 */
			this.parentId = data.parent_id;
		} else {
			this.parentId ??= null;
		}

		if ('thread_metadata' in data) {
			/**
			 * Whether the thread is locked
			 *
			 * @type {?boolean}
			 */
			this.locked = data.thread_metadata.locked ?? false;

			/**
			 * Whether the thread is archived
			 *
			 * @type {?boolean}
			 */
			this.archived = data.thread_metadata.archived;

			/**
			 * The amount of time (in minutes) after which the thread will automatically archive in case of no recent activity
			 *
			 * @type {?ThreadAutoArchiveDuration}
			 */
			this.autoArchiveDuration = data.thread_metadata.auto_archive_duration;

			/**
			 * The timestamp when the thread's archive status was last changed
			 * <info>If the thread was never archived or unarchived, this is the timestamp at which the thread was
			 * created</info>
			 *
			 * @type {?number}
			 */
			this.archiveTimestamp = Date.parse(data.thread_metadata.archive_timestamp);

			if ('create_timestamp' in data.thread_metadata) {
				// Note: this is needed because we can't assign directly to getters
				this._createdTimestamp = Date.parse(data.thread_metadata.create_timestamp);
			}
		} else {
			this.locked ??= null;
			this.archived ??= null;
			this.autoArchiveDuration ??= null;
			this.archiveTimestamp ??= null;
			this.invitable ??= null;
		}

		this._createdTimestamp ??= this.type === ChannelType.PrivateThread ? super.createdTimestamp : null;

		if ('message_count' in data) {
			/**
			 * The approximate count of messages in this thread
			 * <info>Threads created before July 1, 2022 may have an inaccurate count.
			 * If you need an approximate value higher than that, use `ThreadChannel#messages.cache.size`</info>
			 *
			 * @type {?number}
			 */
			this.messageCount = data.message_count;
		} else {
			this.messageCount ??= null;
		}

		if ('member_count' in data) {
			/**
			 * The approximate count of users in this thread
			 * <info>This stops counting at 50. If you need an approximate value higher than that, use
			 * `ThreadChannel#members.cache.size`</info>
			 *
			 * @type {?number}
			 */
			this.memberCount = data.member_count;
		} else {
			this.memberCount ??= null;
		}

		if ('total_message_sent' in data) {
			/**
			 * The number of messages ever sent in a thread, similar to {@link ThreadChannel#messageCount} except it
			 * will not decrement whenever a message is deleted
			 *
			 * @type {?number}
			 */
			this.totalMessageSent = data.total_message_sent;
		} else {
			this.totalMessageSent ??= null;
		}

		if (data.member && this.client.user) this.members._add({ user_id: this.client.user.id, ...data.member });
		if (data.messages) for (const message of data.messages) this.messages._add(message);

		if ('applied_tags' in data) {
			/**
			 * The tags applied to this thread
			 *
			 * @type {Snowflake[]}
			 */
			this.appliedTags = data.applied_tags;
		} else {
			this.appliedTags ??= [];
		}
	}

	/**
	 * The timestamp when this thread was created. This isn't available for threads
	 * created before 2022-01-09
	 *
	 * @type {?number}
	 * @readonly
	 */
	get createdTimestamp() {
		return this._createdTimestamp;
	}

	/**
	 * A collection of associated guild member objects of this thread's members
	 *
	 * @type {Collection<Snowflake, GuildMember>}
	 * @readonly
	 */
	get guildMembers() {
		return this.members.cache.mapValues(member => member.guildMember);
	}

	/**
	 * The time at which this thread's archive status was last changed
	 * <info>If the thread was never archived or unarchived, this is the time at which the thread was created</info>
	 *
	 * @type {?Date}
	 * @readonly
	 */
	get archivedAt() {
		return this.archiveTimestamp && new Date(this.archiveTimestamp);
	}

	/**
	 * The time the thread was created at
	 *
	 * @type {?Date}
	 * @readonly
	 */
	get createdAt() {
		return this.createdTimestamp && new Date(this.createdTimestamp);
	}

	/**
	 * The parent channel of this thread
	 *
	 * @type {?(AnnouncementChannel|TextChannel|ForumChannel|MediaChannel)}
	 * @readonly
	 */
	get parent() {
		return this.guild.channels.resolve(this.parentId);
	}

	/**
	 * Makes the client user join the thread.
	 *
	 * @returns {Promise<ThreadChannel>}
	 */
	async join() {
		await this.members.add('@me');
		return this;
	}

	/**
	 * Makes the client user leave the thread.
	 *
	 * @returns {Promise<ThreadChannel>}
	 */
	async leave() {
		await this.members.remove('@me');
		return this;
	}

	/**
	 * Gets the overall set of permissions for a member or role in this thread's parent channel, taking overwrites into
	 * account.
	 *
	 * @param {UserResolvable|RoleResolvable} memberOrRole The member or role to obtain the overall permissions for
	 * @param {boolean} [checkAdmin=true] Whether having the {@link PermissionFlagsBits.Administrator} permission
	 * will return all permissions
	 * @returns {?Readonly<PermissionsBitField>}
	 */
	permissionsFor(memberOrRole, checkAdmin) {
		return this.parent?.permissionsFor(memberOrRole, checkAdmin) ?? null;
	}

	/**
	 * Options used to fetch a thread owner.
	 *
	 * @typedef {BaseFetchOptions} FetchThreadOwnerOptions
	 * @property {boolean} [withMember] Whether to also return the guild member associated with this thread member
	 */

	/**
	 * Fetches the owner of this thread. If the thread member object isn't needed,
	 * use {@link ThreadChannel#ownerId} instead.
	 *
	 * @param {FetchThreadOwnerOptions} [options] Options for fetching the owner
	 * @returns {Promise<ThreadMember>}
	 */
	async fetchOwner(options) {
		return this.members._fetchSingle({ ...options, member: this.ownerId });
	}

	/**
	 * The options used to edit a thread channel
	 *
	 * @typedef {Object} ThreadEditOptions
	 * @property {string} [name] The new name for the thread
	 * @property {boolean} [archived] Whether the thread is archived
	 * @property {ThreadAutoArchiveDuration} [autoArchiveDuration] The amount of time after which the thread
	 * should automatically archive in case of no recent activity
	 * @property {number} [rateLimitPerUser] The rate limit per user (slowmode) for the thread in seconds
	 * @property {boolean} [locked] Whether the thread is locked
	 * @property {boolean} [invitable] Whether non-moderators can add other non-moderators to a thread
	 * <info>Can only be edited on {@link ChannelType.PrivateThread}</info>
	 * @property {Snowflake[]} [appliedTags] The tags to apply to the thread
	 * @property {ChannelFlagsResolvable} [flags] The flags to set on the channel
	 * @property {string} [reason] Reason for editing the thread
	 */

	/**
	 * Sets the duration after which the thread will automatically archive in case of no recent activity.
	 *
	 * @param {ThreadAutoArchiveDuration} autoArchiveDuration The amount of time after which the thread
	 * should automatically archive in case of no recent activity
	 * @param {string} [reason] Reason for changing the auto archive duration
	 * @returns {Promise<ThreadChannel>}
	 * @example
	 * // Set the thread's auto archive time to 1 hour
	 * thread.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneHour)
	 *   .then(newThread => {
	 *     console.log(`Thread will now archive after ${newThread.autoArchiveDuration} minutes of inactivity`);
	 *    });
	 *   .catch(console.error);
	 */
	async setAutoArchiveDuration(autoArchiveDuration, reason) {
		return this.edit({ autoArchiveDuration, reason });
	}

	async setName(name, reason) {
		return this.edit({ name, reason });
	}

	/**
	 * Whether the client user is a member of the thread.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get joined() {
		return this.members.cache.has(this.client.user?.id);
	}

	/**
	 * Whether the thread is editable by the client user (name, archived, autoArchiveDuration)
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get editable() {
		return (
			(this.ownerId === this.client.user.id && (this.type !== ChannelType.PrivateThread || this.joined)) ||
			this.manageable
		);
	}

	/**
	 * Whether the thread is joinable by the client user
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get joinable() {
		return (
			!this.archived &&
			!this.joined &&
			this.permissionsFor(this.client.user)?.has(
				this.type === ChannelType.PrivateThread ? PermissionFlagsBits.ManageThreads : PermissionFlagsBits.ViewChannel,
				false,
			)
		);
	}

	get manageable() {
		const permissions = this.permissionsFor(this.client.user);
		if (!permissions) return false;
		// This flag allows managing even if timed out
		if (permissions.has(PermissionFlagsBits.Administrator, false)) return true;

		return (
			this.guild.members.me.communicationDisabledUntilTimestamp < Date.now() &&
			permissions.has(PermissionFlagsBits.ManageThreads, false)
		);
	}

	/**
	 * Whether the thread is viewable by the client user
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get viewable() {
		const permissions = this.permissionsFor(this.client.user);
		if (!permissions) return false;
		return permissions.has(PermissionFlagsBits.ViewChannel, false);
	}

	/**
	 * Whether the client user can send messages in this thread
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get sendable() {
		const permissions = this.permissionsFor(this.client.user);
		if (!permissions) return false;
		// This flag allows sending even if timed out
		if (permissions.has(PermissionFlagsBits.Administrator, false)) return true;

		return (
			!(this.archived && this.locked && !this.manageable) &&
			(this.type !== ChannelType.PrivateThread || this.joined || this.manageable) &&
			permissions.has(PermissionFlagsBits.SendMessagesInThreads, false) &&
			this.guild.members.me.communicationDisabledUntilTimestamp < Date.now()
		);
	}

	/**
	 * Whether the thread is unarchivable by the client user
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get unarchivable() {
		return this.archived && this.sendable && (!this.locked || this.manageable);
	}

	/**
	 * Deletes this thread.
	 *
	 * @param {string} [reason] Reason for deleting this thread
	 * @returns {Promise<ThreadChannel>}
	 * @example
	 * // Delete the thread
	 * thread.delete('cleaning out old threads')
	 *   .then(deletedThread => console.log(deletedThread))
	 *   .catch(console.error);
	 */
	async delete(reason) {
		await this.guild.channels.delete(this.id, reason);
		return this;
	}

	// These are here only for documentation purposes - they are implemented by TextBasedChannel

	send() { }

	createMessageCollector() { }

	awaitMessages() { }

	createMessageComponentCollector() { }

	awaitMessageComponent() { }
}

TextBasedChannel.applyToClass(ThreadChannel, ['fetchWebhooks']);

exports.ThreadChannel = ThreadChannel;
