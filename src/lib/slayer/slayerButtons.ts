import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { InteractionID } from '@/lib/InteractionID.js';

export const slayerActionButtons = [
	new ActionRowBuilder<ButtonBuilder>().addComponents([
		new ButtonBuilder({
			label: 'Autoslay (Saved)',
			style: ButtonStyle.Secondary,
			customId: InteractionID.Slayer.AutoSlaySaved
		}),
		new ButtonBuilder({
			label: 'Autoslay (Default)',
			style: ButtonStyle.Secondary,
			customId: InteractionID.Slayer.AutoSlayDefault
		}),
		new ButtonBuilder({
			label: 'Autoslay (EHP)',
			style: ButtonStyle.Secondary,
			customId: InteractionID.Slayer.AutoSlayEHP
		}),
		new ButtonBuilder({
			label: 'Autoslay (Boss)',
			style: ButtonStyle.Secondary,
			customId: InteractionID.Slayer.AutoSlayBoss
		})
	]),
	new ActionRowBuilder<ButtonBuilder>().addComponents([
		new ButtonBuilder({
			label: 'Cancel Task + New (30 points)',
			style: ButtonStyle.Danger,
			customId: InteractionID.Slayer.SkipTask
		}),
		new ButtonBuilder({
			label: 'Block Task + New (100 points)',
			style: ButtonStyle.Danger,
			customId: InteractionID.Slayer.BlockTask
		})
	])
];
