import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, userMention } from '@discordjs/builders';
import { DiscordAPIError } from '@discordjs/rest';
import {
	AttachmentBuilder,
	AutocompleteInteraction,
	type BaseMessageOptions,
	ButtonInteraction,
	type CacheType,
	type Channel,
	ChatInputCommandInteraction,
	Client,
	Collection,
	type CollectorFilter,
	CommandInteraction,
	type CommandInteractionOption,
	DMChannel,
	Events,
	Guild,
	type GuildMember,
	type Interaction,
	type InteractionReplyOptions,
	Message,
	MessageCollector,
	type MessageComponentType,
	type MessageCreateOptions,
	type MessageEditOptions,
	PartialGroupDMChannel,
	Partials,
	PermissionsBitField,
	type Role,
	type SelectMenuInteraction,
	type TextBasedChannel,
	TextChannel,
	type User,
	WebhookClient
} from '@oldschoolgg/discord.js';
import {
	ActivityType,
	ChannelType,
	ComponentType,
	GatewayIntentBits,
	InteractionResponseType,
	MessageFlags,
	PresenceUpdateStatus,
	Routes
} from 'discord-api-types/v10';

export enum ButtonStyle {
	Primary = 1,
	Secondary = 2,
	Success = 3,
	Danger = 4,
	Link = 5,
	Premium = 6
}

export {
	DiscordAPIError,
	Message,
	InteractionResponseType,
	MessageFlags,
	ButtonInteraction,
	MessageCollector,
	AttachmentBuilder,
	Routes,
	PermissionsBitField,
	ButtonBuilder,
	ActionRowBuilder,
	ComponentType,
	userMention,
	ChannelType,
	EmbedBuilder,
	Collection,
	PresenceUpdateStatus,
	GatewayIntentBits,
	ActivityType,
	Events,
	Partials
};

export { WebhookClient, Client, Guild, type GuildMember, type Role, type User };

export type {
	CollectorFilter,
	CacheType,
	MessageCreateOptions,
	MessageEditOptions,
	BaseMessageOptions,
	MessageComponentType
};

// Channels
export { type TextBasedChannel, PartialGroupDMChannel, DMChannel, TextChannel, type Channel };

// Interactions
export {
	type Interaction,
	ChatInputCommandInteraction,
	type InteractionReplyOptions,
	type SelectMenuInteraction,
	CommandInteraction,
	AutocompleteInteraction
};
export type { CommandInteractionOption };

export * from '@discordjs/formatters';
export * from 'discord-api-types/v10';

export * from './util.js';
