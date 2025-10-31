import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, userMention } from '@discordjs/builders';
import {
	AttachmentBuilder,
	AutocompleteInteraction,
	type BaseMessageOptions,
	ButtonInteraction,
	type CacheType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	type CollectorFilter,
	CommandInteraction,
	type CommandInteractionOption,
	Events,
	type Interaction,
	type InteractionReplyOptions,
	MessageCollector,
	type MessageComponentType,
	type MessageCreateOptions,
	type MessageEditOptions,
	Partials,
	PermissionsBitField,
	type SelectMenuInteraction,
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

export { WebhookClient, Client };

export type {
	CollectorFilter,
	CacheType,
	MessageCreateOptions,
	MessageEditOptions,
	BaseMessageOptions,
	MessageComponentType
};

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

export type ApplicationCommandOptionChoiceData<Value extends number | string = number | string> = {
	name: string;
	value: Value;
};
