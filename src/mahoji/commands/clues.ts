import { EmbedBuilder } from '@oldschoolgg/discord';
import { toTitleCase } from '@oldschoolgg/toolkit';
import { Hiscores } from 'oldschooljs/hiscores';

export const cluesCommand = defineCommand({
	name: 'clues',
	description: 'See your OSRS clue scores.',
	attributes: {
		examples: ['/clues rsn:Magnaboy']
	},
	options: [
		{
			type: 'String',
			name: 'rsn',
			description: 'Your runescape username.',
			required: true
		}
	],
	run: async ({ options }) => {
		const { player, error } = await Hiscores.fetch(options.rsn);
		if (error !== null) {
			return error;
		}
		const clues = player.clues;

		const embed = new EmbedBuilder()
			.setAuthor({ name: options.rsn })
			.setColor(52_224)
			.setThumbnail('https://i.imgur.com/azW3cSB.png');

		for (const tier of Object.keys(clues) as (keyof typeof clues)[]) {
			embed.addFields({
				name: toTitleCase(tier),
				value: `**Rank:** ${clues[tier].rank.toLocaleString()}\n**Score:** ${clues[
					tier
				].score.toLocaleString()}\n`,
				inline: true
			});
		}

		return { embeds: [embed] };
	}
});
