'use strict';

/**
 * @typedef {Object} Events
 * @property {string} ApplicationCommandPermissionsUpdate applicationCommandPermissionsUpdate
 * @property {string} CacheSweep cacheSweep
 * @property {string} ChannelCreate channelCreate
 * @property {string} ChannelDelete channelDelete
 * @property {string} ChannelUpdate channelUpdate
 * @property {string} ClientReady clientReady
 * @property {string} Debug debug
 * @property {string} Error error
 * @property {string} GuildAvailable guildAvailable
 * @property {string} GuildBanAdd guildBanAdd
 * @property {string} GuildBanRemove guildBanRemove
 * @property {string} GuildCreate guildCreate
 * @property {string} GuildDelete guildDelete
 * @property {string} GuildIntegrationsUpdate guildIntegrationsUpdate
 * @property {string} GuildMemberAdd guildMemberAdd
 * @property {string} GuildMemberAvailable guildMemberAvailable
 * @property {string} GuildMemberRemove guildMemberRemove
 * @property {string} GuildMembersChunk guildMembersChunk
 * @property {string} GuildMemberUpdate guildMemberUpdate
 * @property {string} GuildRoleCreate roleCreate
 * @property {string} GuildRoleDelete roleDelete
 * @property {string} GuildRoleUpdate roleUpdate
 * @property {string} GuildUnavailable guildUnavailable
 * @property {string} GuildUpdate guildUpdate
 * @property {string} InteractionCreate interactionCreate
 * @property {string} Invalidated invalidated
 * @property {string} MessageCreate messageCreate
 * @property {string} MessageDelete messageDelete
 * @property {string} MessagePollVoteAdd messagePollVoteAdd
 * @property {string} MessagePollVoteRemove messagePollVoteRemove
 * @property {string} MessageUpdate messageUpdate
 * @property {string} StageInstanceCreate stageInstanceCreate
 * @property {string} StageInstanceDelete stageInstanceDelete
 * @property {string} StageInstanceUpdate stageInstanceUpdate
 * @property {string} SubscriptionCreate subscriptionCreate
 * @property {string} SubscriptionUpdate subscriptionUpdate
 * @property {string} SubscriptionDelete subscriptionDelete
 * @property {string} ThreadCreate threadCreate
 * @property {string} ThreadDelete threadDelete
 * @property {string} ThreadListSync threadListSync
 * @property {string} ThreadMemberUpdate threadMemberUpdate
 * @property {string} ThreadUpdate threadUpdate
 * @property {string} UserUpdate userUpdate
 * @property {string} Warn warn
 * @property {string} WebhooksUpdate webhooksUpdate
 */

// JSDoc for IntelliSense purposes
/**
 * @type {Events}
 * @ignore
 */
exports.Events = {
	ApplicationCommandPermissionsUpdate: 'applicationCommandPermissionsUpdate',
	CacheSweep: 'cacheSweep',
	ChannelCreate: 'channelCreate',
	ChannelDelete: 'channelDelete',
	ChannelUpdate: 'channelUpdate',
	ClientReady: 'clientReady',
	Debug: 'debug',
	Error: 'error',
	GuildAvailable: 'guildAvailable',
	GuildBanAdd: 'guildBanAdd',
	GuildBanRemove: 'guildBanRemove',
	GuildCreate: 'guildCreate',
	GuildDelete: 'guildDelete',
	GuildIntegrationsUpdate: 'guildIntegrationsUpdate',
	GuildMemberAdd: 'guildMemberAdd',
	GuildMemberAvailable: 'guildMemberAvailable',
	GuildMemberRemove: 'guildMemberRemove',
	GuildMembersChunk: 'guildMembersChunk',
	GuildMemberUpdate: 'guildMemberUpdate',
	GuildRoleCreate: 'roleCreate',
	GuildRoleDelete: 'roleDelete',
	GuildRoleUpdate: 'roleUpdate',
	GuildUnavailable: 'guildUnavailable',
	GuildUpdate: 'guildUpdate',
	InteractionCreate: 'interactionCreate',
	Invalidated: 'invalidated',
	MessageCreate: 'messageCreate',
	MessageDelete: 'messageDelete',
	MessagePollVoteAdd: 'messagePollVoteAdd',
	MessagePollVoteRemove: 'messagePollVoteRemove',
	MessageUpdate: 'messageUpdate',
	ThreadCreate: 'threadCreate',
	ThreadDelete: 'threadDelete',
	ThreadListSync: 'threadListSync',
	ThreadMemberUpdate: 'threadMemberUpdate',
	ThreadUpdate: 'threadUpdate',
	UserUpdate: 'userUpdate',
	Warn: 'warn',
	WebhooksUpdate: 'webhooksUpdate',
};
