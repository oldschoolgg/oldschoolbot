import { Prisma } from '@prisma/client';
import { MessageButton, TextChannel } from 'discord.js';
import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, InteractionResponseType, InteractionType, MessageFlags } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { CommandOption } from 'mahoji/dist/lib/types';

import { client } from '..';
import { SILENT_ERROR } from '../lib/constants';
import { baseFilters, filterableTypes } from '../lib/data/filterables';
import { evalMathExpression } from '../lib/expressionParser';
import { prisma } from '../lib/settings/prisma';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { assert } from '../lib/util';

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
	channelID: string,
	userID: bigint,
	interaction: SlashCommandInteraction,
	str: string
) {
	const channel = client.channels.cache.get(channelID);
	if (!channel || !(channel instanceof TextChannel)) throw new Error('Channel for confirmation not found.');
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

export async function mahojiUserSettingsUpdate(user: string | KlasaUser, data: Prisma.UserUpdateArgs['data']) {
	const klasaUser = typeof user === 'string' ? await client.fetchUser(user) : user;

	const newUser = await prisma.user.update({
		data,
		where: {
			id: klasaUser.id
		}
	});

	// Patch instead of syncing to avoid another database read.
	await klasaUser.settings.sync(true);
	assert(klasaUser.settings.get(UserSettings.LMSPoints) === newUser.lms_points, 'Patched user should match');

	return { newUser };
}
