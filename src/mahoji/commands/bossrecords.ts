import { EmbedBuilder, type PaginatedMessagePage } from '@oldschoolgg/discord';
import { toTitleCase } from '@oldschoolgg/toolkit';
import { type BossRecords, bossNameMap, Hiscores } from 'oldschooljs/hiscores';

import { miscEmojis } from '@/lib/data/emojis.js';
import pets from '@/lib/data/pets.js';
import { chunk } from 'remeda';

function getEmojiForBoss(key: keyof typeof miscEmojis | string) {
	if (key in miscEmojis) {
		return miscEmojis[key as keyof typeof miscEmojis];
	}

	const pet = pets.find(_pet => _pet.bossKeys?.includes(key));
	if (pet) return pet.emoji;
}

export const bossrecordCommand = defineCommand({
	name: 'bossrecords',
	description: 'Shows your OSRS boss records.',
	options: [
		{
			type: 'String',
			name: 'rsn',
			description: 'The runescape username you want to check.',
			required: true
		}
	],
	run: async ({ options, interaction }) => {
		await interaction.defer();
		const { player, error } = await Hiscores.fetch(options.rsn);
		if (error !== null) {
			return error;
		}

		const sortedEntries = Object.entries(player.bossRecords)
			.filter(([, { rank, score }]) => rank !== -1 && score !== -1)
			.sort(([, a], [, b]) => a.rank - b.rank);

		if (sortedEntries.length === 0) {
			return 'You have no boss records!. Try logging into the game, and logging out.';
		}

		const pages: PaginatedMessagePage[] = [];
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

		return interaction.makePaginatedMessage({ pages });
	}
});
