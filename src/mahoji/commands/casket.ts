import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { client } from '../..';
import { PerkTier } from '../../lib/constants';
import ClueTiers from '../../lib/minions/data/clueTiers';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Workers } from '../../lib/workers';
import { OSBMahojiCommand } from '../lib/util';

function determineLimit(user: KlasaUser) {
	const perkTier = getUsersPerkTier(user);
	if (perkTier >= PerkTier.Six) return 300_000;
	if (perkTier >= PerkTier.Five) return 200_000;
	if (perkTier >= PerkTier.Four) return 100_000;
	if (perkTier === PerkTier.Three) return 40_000;
	if (perkTier === PerkTier.Two) return 20_000;
	if (perkTier === PerkTier.One) return 1000;

	return 50;
}

export const casketCommand: OSBMahojiCommand = {
	name: 'casket',
	description: 'Simulate opening lots of clues caskets.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The casket you want to open.',
			required: true,
			choices: ClueTiers.map(i => ({ name: i.name, value: i.name }))
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to open.',
			required: true,
			min_value: 1,
			max_value: 100_000
		}
	],
	run: async ({ options, userID, interaction }: CommandRunOptions<{ name: string; quantity: number }>) => {
		const user = await client.fetchUser(userID.toString());
		const limit = determineLimit(user);
		if (options.quantity > limit) {
			return `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 100,000 by becoming a patron at <https://www.patreon.com/oldschoolbot>.*`;
		}

		const clueTier = ClueTiers.find(_tier => _tier.name.toLowerCase() === options.name.toLowerCase());

		if (!clueTier) {
			return `Not a valid clue tier. The valid tiers are: ${ClueTiers.map(_tier => _tier.name).join(', ')}`;
		}

		await interaction.deferReply();

		const [loot, title] = await Workers.casketOpen({ quantity: options.quantity, clueTierID: clueTier.id });

		if (Object.keys(loot.bank).length === 0) return `${title} and got nothing :(`;

		const { image } = await client.tasks
			.get('bankImage')!
			.generateBankImage(new Bank(loot.bank), title, true, {}, user);

		return {
			attachments: [{ fileName: 'loot.jpg', buffer: image! }]
		};
	}
};
