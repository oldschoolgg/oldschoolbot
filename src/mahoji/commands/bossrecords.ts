import {
	type CommandRunOptions,
	type OSBMahojiCommand,
	channelIsSendable,
	makePaginatedMessage
} from '@oldschoolgg/toolkit/discord-util';
import { toTitleCase } from '@oldschoolgg/toolkit/string-util';
import { ApplicationCommandOptionType, EmbedBuilder, type MessageEditOptions } from 'discord.js';
import { chunk } from 'e';
import { type BossRecords, Hiscores, bossNameMap } from 'oldschooljs';

import { logError, logErrorForInteraction } from '@/lib/util/logError';
import pets from '../../lib/data/pets';
import { deferInteraction } from '../../lib/util/interactionReply';

// Emojis for bosses with no pets
const miscEmojis = {
	barrowsChests: '<:Dharoks_helm:403038864199122947>',
	hespori: '<:Bottomless_compost_bucket:545978484078411777>',
	bryophyta: '<:Bryophytas_essence:455835859799769108>',
	crazyArchaeologist: '<:Fedora:456179157303427092>',
	derangedArchaeologist: '<:Fedora:456179157303427092>',
	mimic: '<:Casket:365003978678730772>',
	obor: '<:Hill_giant_club:421045456194240523>'
};

type MiscEmojisKeys = keyof typeof miscEmojis;

function getEmojiForBoss(key: MiscEmojisKeys | string) {
	if (key in miscEmojis) {
		return miscEmojis[key as MiscEmojisKeys];
	}

	const pet = pets.find(_pet => _pet.bossKeys?.includes(key));
	if (pet) return pet.emoji;
}

export const bossrecordCommand: OSBMahojiCommand = {
	name: 'bossrecords',
	description: 'Shows your OSRS boss records.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'rsn',
			description: 'The runescape username you want to check.',
			required: true
		}
	],
	run: async ({ options, channelID, userID, interaction }: CommandRunOptions<{ rsn: string }>) => {
		await deferInteraction(interaction);
		const { bossRecords } = await Hiscores.fetch(options.rsn).catch(err => {
			throw err.message;
		});

		const sortedEntries = Object.entries(bossRecords)
			.filter(([, { rank, score }]) => rank !== -1 && score !== -1)
			.sort(([, a], [, b]) => a.rank - b.rank);

		if (sortedEntries.length === 0) {
			return 'You have no boss records!. Try logging into the game, and logging out.';
		}

		const pages: MessageEditOptions[] = [];
		for (const page of chunk(sortedEntries, 12)) {
			const embed = new EmbedBuilder()
				.setAuthor({ name: `${toTitleCase(options.rsn)} - Boss Records` })
				.setColor(52_224);

			for (const [name, { rank, score }] of page) {
				embed.addFields({
					name: `${getEmojiForBoss(name) || ''} ${bossNameMap.get(name as keyof BossRecords)}`,
					value: `**KC:** ${score.toLocaleString()}\n**Rank:** ${rank.toLocaleString()}`,
					inline: true
				});
			}

			pages.push({ embeds: [embed] });
		}

		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return 'Invalid channel.';

		await makePaginatedMessage(
			channel,
			pages,
			(err, itx) => {
				if (itx) {
					logErrorForInteraction(err, itx);
				} else {
					logError(err);
				}
			},
			userID
		);
		return {
			content: `Showing OSRS Boss Records for \`${options.rsn}\`.`,
			ephemeral: true
		};
	}
};
