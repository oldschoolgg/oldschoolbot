import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord-api-types/v10';

import { InteractionID } from '@/lib/InteractionID.js';

export const slayerActionButtons = [
	new ActionRowBuilder<ButtonBuilder>().addComponents([
		new ButtonBuilder({
			label: 'Autoslay (Saved)',
			style: ButtonStyle.Secondary,
			custom_id: InteractionID.Slayer.AutoSlaySaved
		}),
		new ButtonBuilder({
			label: 'Autoslay (Default)',
			style: ButtonStyle.Secondary,
			custom_id: InteractionID.Slayer.AutoSlayDefault
		}),
		new ButtonBuilder({
			label: 'Autoslay (EHP)',
			style: ButtonStyle.Secondary,
			custom_id: InteractionID.Slayer.AutoSlayEHP
		}),
		new ButtonBuilder({
			label: 'Autoslay (Boss)',
			style: ButtonStyle.Secondary,
			custom_id: InteractionID.Slayer.AutoSlayBoss
		})
	]),
	new ActionRowBuilder<ButtonBuilder>().addComponents([
		new ButtonBuilder({
			label: 'Cancel Task + New (30 points)',
			style: ButtonStyle.Danger,
			custom_id: InteractionID.Slayer.SkipTask
		}),
		new ButtonBuilder({
			label: 'Block Task + New (100 points)',
			style: ButtonStyle.Danger,
			custom_id: InteractionID.Slayer.BlockTask
		})
	])
];
