import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	type ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';

import type { OSBMahojiCommand } from '../lib/util';
import { bankCommand } from './bank';

const bankFormats = ['json', 'text_paged', 'text_full'] as const;
type BankFormat = (typeof bankFormats)[number];

export const bsCommand: OSBMahojiCommand = {
	name: 'bs',
	description: 'Search your minions bank.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'search',
			description: 'Search for item names in your bank.',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'format',
			description: 'The format to return your bank in.',
			required: false,
			choices: bankFormats.map(i => ({ name: i, value: i }))
		}
	],
	run: async (
		options: CommandRunOptions<{
			search?: string;
			format?: BankFormat;
		}>
	) => {
		// Create the modal
		const modal = new ModalBuilder().setCustomId('myModal').setTitle('My Modal');

		// Add components to modal

		// Create the text input components
		const favoriteColorInput = new TextInputBuilder()
			.setCustomId('favoriteColorInput')
			// The label is the prompt the user sees for this input
			.setLabel("What's your favorite color?")
			// Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		const hobbiesInput = new TextInputBuilder()
			.setCustomId('hobbiesInput')
			.setLabel("What's some of your favorite hobbies?")
			// Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(favoriteColorInput);
		const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(hobbiesInput);

		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow);

		// Show the modal to the user
		await options.interaction.showModal(modal);

		const res = await bankCommand.run(options);
		return res;
	}
};
