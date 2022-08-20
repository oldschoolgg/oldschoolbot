import { MessageEmbed, MessageOptions } from 'discord.js';
import { chunk } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions, MessageFlags } from 'mahoji';
import { Hiscores } from 'oldschooljs';
import { bossNameMap } from 'oldschooljs/dist/constants';

import pets from '../../lib/data/pets';
import { channelIsSendable, makePaginatedMessage, toTitleCase } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';

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

	const pet = pets.find(_pet => _pet.bossKeys && _pet.bossKeys.includes(key));
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
		await interaction.deferReply({ ephemeral: true });
		const { bossRecords } = await Hiscores.fetch(options.rsn).catch(err => {
			throw err.message;
		});

		const sortedEntries = Object.entries(bossRecords)
			.filter(([, { rank, score }]) => rank !== -1 && score !== -1)
			.sort(([, a], [, b]) => a.rank - b.rank);

		if (sortedEntries.length === 0) {
			return 'You have no boss records!. Try logging into the game, and logging out.';
		}

		const pages: MessageOptions[] = [];
		for (const page of chunk(sortedEntries, 12)) {
			const embed = new MessageEmbed().setAuthor(`${toTitleCase(options.rsn)} - Boss Records`).setColor(52_224);

			for (const [name, { rank, score }] of page) {
				embed.addField(
					`${getEmojiForBoss(name) || ''} ${bossNameMap.get(name)}`,
					`**KC:** ${score.toLocaleString()}\n**Rank:** ${rank.toLocaleString()}`,
					true
				);
			}

			pages.push({ embeds: [embed] });
		}

		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return 'Invalid channel.';
		const msg = await channel.send({ embeds: [new MessageEmbed().setDescription('Loading...')] });

		await makePaginatedMessage(msg, pages, await globalClient.fetchUser(userID));
		return {
			content: `Showing OSRS Boss Records for \`${options.rsn}\`.`,
			flags: MessageFlags.Ephemeral
		};
	}
};
