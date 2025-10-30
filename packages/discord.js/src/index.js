const start = performance.now();

'use strict';
console.log("D.JS FORK");
const { __exportStar } = require('tslib');

// "Root" classes (starting points)
exports.BaseClient = require('./client/BaseClient.js').BaseClient;
exports.Client = require('./client/Client.js').Client;
exports.Shard = require('./sharding/Shard.js').Shard;
exports.ShardClientUtil = require('./sharding/ShardClientUtil.js').ShardClientUtil;
exports.ShardingManager = require('./sharding/ShardingManager.js').ShardingManager;
exports.WebhookClient = require('./client/WebhookClient.js').WebhookClient;

// Errors
exports.DiscordjsError = require('./errors/DJSError.js').DiscordjsError;
exports.DiscordjsTypeError = require('./errors/DJSError.js').DiscordjsTypeError;
exports.DiscordjsRangeError = require('./errors/DJSError.js').DiscordjsRangeError;
exports.DiscordjsErrorCodes = require('./errors/ErrorCodes.js').ErrorCodes;

// Utilities
exports.ActivityFlagsBitField = require('./util/ActivityFlagsBitField.js').ActivityFlagsBitField;
exports.ApplicationFlagsBitField = require('./util/ApplicationFlagsBitField.js').ApplicationFlagsBitField;
exports.AttachmentFlagsBitField = require('./util/AttachmentFlagsBitField.js').AttachmentFlagsBitField;
exports.BaseManager = require('./managers/BaseManager.js').BaseManager;
exports.BitField = require('./util/BitField.js').BitField;
exports.ChannelFlagsBitField = require('./util/ChannelFlagsBitField.js').ChannelFlagsBitField;
exports.Collection = require('@discordjs/collection').Collection;
exports.Colors = require('./util/Colors.js').Colors;
exports.Constants = require('./util/Constants.js');
exports.Events = require('./util/Events.js').Events;
exports.GuildMemberFlagsBitField = require('./util/GuildMemberFlagsBitField.js').GuildMemberFlagsBitField;
exports.IntentsBitField = require('./util/IntentsBitField.js').IntentsBitField;
exports.LimitedCollection = require('./util/LimitedCollection.js').LimitedCollection;
exports.MessageFlagsBitField = require('./util/MessageFlagsBitField.js').MessageFlagsBitField;
exports.Options = require('./util/Options.js').Options;
exports.Partials = require('./util/Partials.js').Partials;
exports.PermissionsBitField = require('./util/PermissionsBitField.js').PermissionsBitField;
exports.RoleFlagsBitField = require('./util/RoleFlagsBitField.js').RoleFlagsBitField;
exports.ShardEvents = require('./util/ShardEvents.js').ShardEvents;
exports.SnowflakeUtil = require('@sapphire/snowflake').DiscordSnowflake;
exports.Status = require('./util/Status.js').Status;
exports.Sweepers = require('./util/Sweepers.js').Sweepers;
exports.SystemChannelFlagsBitField = require('./util/SystemChannelFlagsBitField.js').SystemChannelFlagsBitField;
exports.ThreadMemberFlagsBitField = require('./util/ThreadMemberFlagsBitField.js').ThreadMemberFlagsBitField;
exports.UserFlagsBitField = require('./util/UserFlagsBitField.js').UserFlagsBitField;

__exportStar(require('./util/DataResolver.js'), exports);

exports.cleanCodeBlockContent = require('./util/Util.js').cleanCodeBlockContent;
exports.cleanContent = require('./util/Util.js').cleanContent;
exports.discordSort = require('./util/Util.js').discordSort;
exports.fetchRecommendedShardCount = require('./util/Util.js').fetchRecommendedShardCount;
exports.flatten = require('./util/Util.js').flatten;
exports.parseWebhookURL = require('./util/Util.js').parseWebhookURL;
exports.resolveColor = require('./util/Util.js').resolveColor;
exports.verifyString = require('./util/Util.js').verifyString;

exports.version = require('../package.json').version;

// Managers
exports.ApplicationCommandManager = require('./managers/ApplicationCommandManager.js').ApplicationCommandManager;
exports.ApplicationCommandPermissionsManager =
	require('./managers/ApplicationCommandPermissionsManager.js').ApplicationCommandPermissionsManager;
exports.ApplicationEmojiManager = require('./managers/ApplicationEmojiManager.js').ApplicationEmojiManager;
exports.CachedManager = require('./managers/CachedManager.js').CachedManager;
exports.ChannelManager = require('./managers/ChannelManager.js').ChannelManager;
exports.DataManager = require('./managers/DataManager.js').DataManager;
exports.DMMessageManager = require('./managers/DMMessageManager.js').DMMessageManager;
exports.GuildApplicationCommandManager =
	require('./managers/GuildApplicationCommandManager.js').GuildApplicationCommandManager;
exports.GuildChannelManager = require('./managers/GuildChannelManager.js').GuildChannelManager;
exports.GuildManager = require('./managers/GuildManager.js').GuildManager;
exports.GuildMemberManager = require('./managers/GuildMemberManager.js').GuildMemberManager;
exports.GuildMemberRoleManager = require('./managers/GuildMemberRoleManager.js').GuildMemberRoleManager;
exports.GuildMessageManager = require('./managers/GuildMessageManager.js').GuildMessageManager;
exports.GuildTextThreadManager = require('./managers/GuildTextThreadManager.js').GuildTextThreadManager;
exports.MessageManager = require('./managers/MessageManager.js').MessageManager;
exports.PermissionOverwriteManager = require('./managers/PermissionOverwriteManager.js').PermissionOverwriteManager;
exports.PollAnswerVoterManager = require('./managers/PollAnswerVoterManager.js').PollAnswerVoterManager;
exports.RoleManager = require('./managers/RoleManager.js').RoleManager;
exports.ThreadManager = require('./managers/ThreadManager.js').ThreadManager;
exports.ThreadMemberManager = require('./managers/ThreadMemberManager.js').ThreadMemberManager;
exports.UserManager = require('./managers/UserManager.js').UserManager;

// Structures
exports.ActionRow = require('./structures/ActionRow.js').ActionRow;
exports.AnnouncementChannel = require('./structures/AnnouncementChannel.js').AnnouncementChannel;
exports.AnonymousGuild = require('./structures/AnonymousGuild.js').AnonymousGuild;
exports.Application = require('./structures/interfaces/Application.js').Application;
exports.ApplicationCommand = require('./structures/ApplicationCommand.js').ApplicationCommand;
exports.ApplicationEmoji = require('./structures/ApplicationEmoji.js').ApplicationEmoji;
exports.ApplicationRoleConnectionMetadata =
	require('./structures/ApplicationRoleConnectionMetadata.js').ApplicationRoleConnectionMetadata;
exports.Attachment = require('./structures/Attachment.js').Attachment;
exports.AttachmentBuilder = require('./structures/AttachmentBuilder.js').AttachmentBuilder;
exports.AutocompleteInteraction = require('./structures/AutocompleteInteraction.js').AutocompleteInteraction;
exports.Base = require('./structures/Base.js').Base;
exports.BaseChannel = require('./structures/BaseChannel.js').BaseChannel;
exports.BaseGuild = require('./structures/BaseGuild.js').BaseGuild;
exports.BaseGuildTextChannel = require('./structures/BaseGuildTextChannel.js').BaseGuildTextChannel;
exports.BaseInteraction = require('./structures/BaseInteraction.js').BaseInteraction;
exports.BaseSelectMenuComponent = require('./structures/BaseSelectMenuComponent.js').BaseSelectMenuComponent;
exports.ButtonComponent = require('./structures/ButtonComponent.js').ButtonComponent;
exports.ButtonInteraction = require('./structures/ButtonInteraction.js').ButtonInteraction;
exports.CategoryChannel = require('./structures/CategoryChannel.js').CategoryChannel;
exports.ChannelSelectMenuComponent = require('./structures/ChannelSelectMenuComponent.js').ChannelSelectMenuComponent;
exports.ChannelSelectMenuInteraction =
	require('./structures/ChannelSelectMenuInteraction.js').ChannelSelectMenuInteraction;
exports.ChatInputCommandInteraction =
	require('./structures/ChatInputCommandInteraction.js').ChatInputCommandInteraction;
exports.ClientApplication = require('./structures/ClientApplication.js').ClientApplication;
exports.ClientUser = require('./structures/ClientUser.js').ClientUser;
exports.Collector = require('./structures/interfaces/Collector.js').Collector;
exports.CommandInteraction = require('./structures/CommandInteraction.js').CommandInteraction;
exports.CommandInteractionOptionResolver =
	require('./structures/CommandInteractionOptionResolver.js').CommandInteractionOptionResolver;
exports.Component = require('./structures/Component.js').Component;
exports.ContainerComponent = require('./structures/ContainerComponent.js').ContainerComponent;
exports.ContextMenuCommandInteraction =
	require('./structures/ContextMenuCommandInteraction.js').ContextMenuCommandInteraction;
exports.DMChannel = require('./structures/DMChannel.js').DMChannel;
exports.Embed = require('./structures/Embed.js').Embed;
exports.Emoji = require('./structures/Emoji.js').Emoji;
exports.FileComponent = require('./structures/FileComponent.js').FileComponent;
exports.Guild = require('./structures/Guild.js').Guild;
exports.GuildChannel = require('./structures/GuildChannel.js').GuildChannel;
exports.GuildMember = require('./structures/GuildMember.js').GuildMember;
exports.GuildPreview = require('./structures/GuildPreview.js').GuildPreview;
exports.Integration = require('./structures/Integration.js').Integration;
exports.IntegrationApplication = require('./structures/IntegrationApplication.js').IntegrationApplication;
exports.InteractionCallback = require('./structures/InteractionCallback.js').InteractionCallback;
exports.InteractionCallbackResource =
	require('./structures/InteractionCallbackResource.js').InteractionCallbackResource;
exports.InteractionCallbackResponse =
	require('./structures/InteractionCallbackResponse.js').InteractionCallbackResponse;
exports.InteractionCollector = require('./structures/InteractionCollector.js').InteractionCollector;
exports.InteractionWebhook = require('./structures/InteractionWebhook.js').InteractionWebhook;
exports.LabelComponent = require('./structures/LabelComponent.js').LabelComponent;
exports.MediaChannel = require('./structures/MediaChannel.js').MediaChannel;
exports.MediaGalleryComponent = require('./structures/MediaGalleryComponent.js').MediaGalleryComponent;
exports.MediaGalleryItem = require('./structures/MediaGalleryItem.js').MediaGalleryItem;
exports.MentionableSelectMenuComponent =
	require('./structures/MentionableSelectMenuComponent.js').MentionableSelectMenuComponent;
exports.MentionableSelectMenuInteraction =
	require('./structures/MentionableSelectMenuInteraction.js').MentionableSelectMenuInteraction;
exports.MentionableSelectMenuInteraction =
	require('./structures/MentionableSelectMenuInteraction.js').MentionableSelectMenuInteraction;
exports.Message = require('./structures/Message.js').Message;
exports.MessageCollector = require('./structures/MessageCollector.js').MessageCollector;
exports.MessageComponentInteraction =
	require('./structures/MessageComponentInteraction.js').MessageComponentInteraction;
exports.MessageContextMenuCommandInteraction =
	require('./structures/MessageContextMenuCommandInteraction.js').MessageContextMenuCommandInteraction;
exports.MessagePayload = require('./structures/MessagePayload.js').MessagePayload;
exports.ModalComponentResolver = require('./structures/ModalComponentResolver.js').ModalComponentResolver;
exports.ModalSubmitInteraction = require('./structures/ModalSubmitInteraction.js').ModalSubmitInteraction;
exports.OAuth2Guild = require('./structures/OAuth2Guild.js').OAuth2Guild;
exports.PartialGroupDMChannel = require('./structures/PartialGroupDMChannel.js').PartialGroupDMChannel;
exports.PermissionOverwrites = require('./structures/PermissionOverwrites.js').PermissionOverwrites;
exports.Poll = require('./structures/Poll.js').Poll;
exports.PollAnswer = require('./structures/PollAnswer.js').PollAnswer;
exports.PrimaryEntryPointCommandInteraction =
	require('./structures/PrimaryEntryPointCommandInteraction.js').PrimaryEntryPointCommandInteraction;
exports.Role = require('./structures/Role.js').Role;
exports.RoleSelectMenuComponent = require('./structures/RoleSelectMenuComponent.js').RoleSelectMenuComponent;
exports.RoleSelectMenuInteraction = require('./structures/RoleSelectMenuInteraction.js').RoleSelectMenuInteraction;
exports.SectionComponent = require('./structures/SectionComponent.js').SectionComponent;
exports.SeparatorComponent = require('./structures/SeparatorComponent.js').SeparatorComponent;
exports.StringSelectMenuComponent = require('./structures/StringSelectMenuComponent.js').StringSelectMenuComponent;
exports.StringSelectMenuInteraction =
	require('./structures/StringSelectMenuInteraction.js').StringSelectMenuInteraction;
exports.Team = require('./structures/Team.js').Team;
exports.TeamMember = require('./structures/TeamMember.js').TeamMember;
exports.TextChannel = require('./structures/TextChannel.js').TextChannel;
exports.TextDisplayComponent = require('./structures/TextDisplayComponent.js').TextDisplayComponent;
exports.TextInputComponent = require('./structures/TextInputComponent.js').TextInputComponent;
exports.ThreadChannel = require('./structures/ThreadChannel.js').ThreadChannel;
exports.ThreadMember = require('./structures/ThreadMember.js').ThreadMember;
exports.ThreadOnlyChannel = require('./structures/ThreadOnlyChannel.js').ThreadOnlyChannel;
exports.ThumbnailComponent = require('./structures/ThumbnailComponent.js').ThumbnailComponent;
exports.UnfurledMediaItem = require('./structures/UnfurledMediaItem.js').UnfurledMediaItem;
exports.User = require('./structures/User.js').User;
exports.UserContextMenuCommandInteraction =
	require('./structures/UserContextMenuCommandInteraction.js').UserContextMenuCommandInteraction;
exports.UserSelectMenuComponent = require('./structures/UserSelectMenuComponent.js').UserSelectMenuComponent;
exports.UserSelectMenuInteraction = require('./structures/UserSelectMenuInteraction.js').UserSelectMenuInteraction;
exports.Webhook = require('./structures/Webhook.js').Webhook;

// External
__exportStar(require('discord-api-types/v10'), exports);
__exportStar(require('@discordjs/builders'), exports);
__exportStar(require('@discordjs/formatters'), exports);
__exportStar(require('@discordjs/rest'), exports);
__exportStar(require('@discordjs/util'), exports);
__exportStar(require('@discordjs/ws'), exports);

const end = performance.now();
console.log(`Discord.js module loaded in ${(end - start).toFixed(2)} ms`);
