'use strict';

const { ChannelType, MessageType, ComponentType } = require('discord-api-types/v10');

/**
 * Max bulk deletable message age
 *
 * @typedef {number} MaxBulkDeletableMessageAge
 */
exports.MaxBulkDeletableMessageAge = 1_209_600_000;

exports.SweeperKeys = [
  'applicationCommands',
  'guildMembers',
  'messages',
  'threadMembers',
  'threads',
  'users',
];

/**
 * The types of messages that are not `System`. The available types are:
 * - {@link MessageType.Default}
 * - {@link MessageType.Reply}
 * - {@link MessageType.ChatInputCommand}
 * - {@link MessageType.ContextMenuCommand}
 *
 * @typedef {MessageType[]} NonSystemMessageTypes
 */
exports.NonSystemMessageTypes = [
  MessageType.Default,
  MessageType.Reply,
  MessageType.ChatInputCommand,
  MessageType.ContextMenuCommand,
];

exports.GuildTextBasedChannelTypes = [
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.AnnouncementThread,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.GuildVoice,
  ChannelType.GuildStageVoice,
];

/**
 * The channels that are text-based.
 * - {@link DMChannel}
 * - {@link GuildTextBasedChannel}
 *
 * @typedef {DMChannel|GuildTextBasedChannel} TextBasedChannels
 */

exports.TextBasedChannelTypes = [...exports.GuildTextBasedChannelTypes, ChannelType.DM, ChannelType.GroupDM];

exports.SendableChannels = [...exports.GuildTextBasedChannelTypes, ChannelType.DM];

/**
 * The types of channels that are threads. The available types are:
 * - {@link ChannelType.AnnouncementThread}
 * - {@link ChannelType.PublicThread}
 * - {@link ChannelType.PrivateThread}
 *
 * @typedef {ChannelType[]} ThreadChannelTypes
 */
exports.ThreadChannelTypes = [ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread];

/**
 * The types of select menus. The available types are:
 * - {@link ComponentType.StringSelect}
 * - {@link ComponentType.UserSelect}
 * - {@link ComponentType.RoleSelect}
 * - {@link ComponentType.MentionableSelect}
 * - {@link ComponentType.ChannelSelect}
 *
 * @typedef {ComponentType[]} SelectMenuTypes
 */
exports.SelectMenuTypes = [
  ComponentType.StringSelect,
  ComponentType.UserSelect,
  ComponentType.RoleSelect,
  ComponentType.MentionableSelect,
  ComponentType.ChannelSelect,
];

/**
 * The types of messages that cannot be deleted. The available types are:
 * - {@link MessageType.RecipientAdd}
 * - {@link MessageType.RecipientRemove}
 * - {@link MessageType.Call}
 * - {@link MessageType.ChannelNameChange}
 * - {@link MessageType.ChannelIconChange}
 * - {@link MessageType.ThreadStarterMessage}
 *
 * @typedef {MessageType[]} UndeletableMessageTypes
 */
exports.UndeletableMessageTypes = [
  MessageType.RecipientAdd,
  MessageType.RecipientRemove,
  MessageType.Call,
  MessageType.ChannelNameChange,
  MessageType.ChannelIconChange,
  MessageType.ThreadStarterMessage,
];

/**
 * Holographic color values for role styling.
 * When using `tertiaryColor`, the API enforces these specific values for holographic effect.
 *
 * @typedef {Object} HolographicStyle
 * @property {number} Primary 11127295 (0xA9FFFF)
 * @property {number} Secondary 16759788 (0xFFCCCC)
 * @property {number} Tertiary 16761760 (0xFFE0A0)
 */
exports.HolographicStyle = {
  Primary: 11_127_295,
  Secondary: 16_759_788,
  Tertiary: 16_761_760,
};
