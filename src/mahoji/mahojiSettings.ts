import { MessageButton, TextChannel } from 'discord.js';
import { Time } from 'e';
import { ApplicationCommandOptionType, InteractionResponseType, InteractionType, MessageFlags } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { CommandOption } from 'mahoji/dist/lib/types';

import { SILENT_ERROR } from '../lib/constants';
import { baseFilters, filterableTypes } from '../lib/data/filterables';
import { evalMathExpression } from '../lib/expressionParser';

export function mahojiParseNumber({ input }: { input: string | undefined | null }): number | null {
	if (input === undefined || input === null) return null;
	const parsed = evalMathExpression(input);
	return parsed;
}

export const filterOption: CommandOption = {
	// what if we allow this
	// autoComplete: [filters.map(i => i.name)]
	type: ApplicationCommandOptionType.String,
	name: 'filter',
	description: 'The filter you want to use.',
	required: false,
	autocomplete: async (value: string) => {
		let res = !value
			? filterableTypes
			: filterableTypes.filter(filter => filter.name.toLowerCase().includes(value.toLowerCase()));

		return [...res]
			.sort((a, b) => baseFilters.indexOf(b) - baseFilters.indexOf(a))
			.slice(0, 10)
			.map(val => ({ name: val.name, value: val.aliases[0] ?? val.name }));
	}
};

export const searchOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'search',
	description: 'An item name search query.',
	required: false
};

export async function handleMahojiConfirmation(
	channel: TextChannel,
	userID: bigint,
	interaction: SlashCommandInteraction,
	str: string
) {
	await interaction.deferReply();

	const confirmMessage = await channel.send({
		content: str,
		components: [
			[
				new MessageButton({
					label: 'Confirm',
					style: 'PRIMARY',
					customID: 'CONFIRM'
				}),
				new MessageButton({
					label: 'Cancel',
					style: 'SECONDARY',
					customID: 'CANCEL'
				})
			]
		]
	});

	const cancel = async () => {
		await confirmMessage.delete();
		await interaction.respond({
			type: InteractionType.ApplicationCommand,
			response: {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: 'You did not confirm in time.',
					flags: MessageFlags.Ephemeral
				}
			},
			interaction
		});
		throw new Error(SILENT_ERROR);
	};

	async function confirm() {
		await confirmMessage.delete();
	}

	try {
		const selection = await confirmMessage.awaitMessageComponentInteraction({
			filter: i => {
				if (i.user.id !== userID.toString()) {
					i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
					return false;
				}
				return true;
			},
			time: Time.Second * 10
		});
		if (selection.customID === 'CANCEL') {
			return cancel();
		}
		if (selection.customID === 'CONFIRM') {
			return confirm();
		}
	} catch {
		return cancel();
	}
}
