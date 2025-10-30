import { ActionRowBuilder, ButtonBuilder, bold, codeBlock, EmbedBuilder, time, userMention } from '@discordjs/builders';
import {
	AttachmentBuilder,
	AutocompleteInteraction,
	ButtonInteraction,
	CommandInteraction,
	DiscordAPIError,
	type GuildMember,
	Message,
	MessageCollector,
	type MessageCreateOptions,
	type MessageEditOptions,
	PermissionsBitField,
	strikethrough
} from '@oldschoolgg/discord.js';
import { ChannelType, ComponentType, InteractionResponseType, MessageFlags, Routes } from 'discord-api-types/v10';

export enum ButtonStyle {
	Primary = 1,
	Secondary = 2,
	Success = 3,
	Danger = 4,
	Link = 5,
	Premium = 6
}

export * from '@discordjs/formatters';
export {
	Message,
	InteractionResponseType,
	MessageFlags,
	ButtonInteraction,
	DiscordAPIError,
	MessageCollector,
	AttachmentBuilder,
	strikethrough,
	Routes,
	CommandInteraction,
	PermissionsBitField,
	AutocompleteInteraction,
	ButtonBuilder,
	ActionRowBuilder,
	ComponentType,
	userMention,
	ChannelType,
	EmbedBuilder,
	bold,
	time,
	codeBlock
};
export type { MessageCreateOptions, MessageEditOptions, GuildMember };
