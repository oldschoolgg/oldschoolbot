import { EmbedBuilder } from '@discordjs/builders';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Hiscores } from 'oldschooljs';

import { toTitleCase } from '../../lib/util/toTitleCase';
import { OSBMahojiCommand } from '../lib/util';

export const cluesCommand: OSBMahojiCommand = {
	name: 'clues',
	description: 'See your OSRS clue scores.',
	attributes: {
		examples: ['/clues rsn:Magnaboy']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'rsn',
			description: 'Your runescape username.',
			required: true
		}
	],
	run: async ({ options }: CommandRunOptions<{ rsn: string }>) => {
		try {
			const { clues } = await Hiscores.fetch(options.rsn);

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
		} catch (err: any) {
			return err.message;
		}
	}
};
