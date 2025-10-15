import { Bank, toKMB } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { PerkTier } from '@/lib/constants.js';
import { marketPriceOfBank } from '@/lib/marketPrices.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { Workers } from '@/lib/workers/index.js';

function calcDropRatesFromBankWithoutUniques(bank: Bank, iterations: number) {
	const results = [];
	for (const [item, qty] of bank.items().sort((a, b) => a[1] - b[1])) {
		const rate = Math.round(iterations / qty);
		if (rate < 2) continue;
		results.push(`${qty}x ${item.name} (1 in ${rate})`);
	}
	return results;
}

function determineLimit(user: MUser) {
	const perkTier = user.perkTier();
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
			type: 'String',
			name: 'name',
			description: 'The casket you want to open.',
			required: true,
			choices: ClueTiers.map(i => ({ name: i.name, value: i.name }))
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity you want to open.',
			required: true,
			min_value: 1,
			max_value: 300_000
		}
	],
	run: async ({ options, user, interaction }: CommandRunOptions<{ name: string; quantity: number }>) => {
		await interaction.defer();
		const limit = determineLimit(user);
		if (options.quantity > limit) {
			return `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 100,000 by becoming a patron at <https://www.patreon.com/oldschoolbot>.*`;
		}

		const clueTier = ClueTiers.find(_tier => _tier.name.toLowerCase() === options.name.toLowerCase());

		if (!clueTier) {
			return `Not a valid clue tier. The valid tiers are: ${ClueTiers.map(_tier => _tier.name).join(', ')}`;
		}

		await interaction.defer();

		const [_loot, title] = await Workers.casketOpen({ quantity: options.quantity, clueTierID: clueTier.id });
		const loot = new Bank(_loot);

		if (loot.length === 0) return `${title} and got nothing :(`;

		const image = await makeBankImage({
			bank: loot,
			title,
			user
		});

		return {
			content: `You opened ${options.quantity} ${clueTier.name} caskets.
**Bot Value:** ${toKMB(loot.value())} (Average of ${toKMB(loot.value() / options.quantity)} per casket)
**Market Value:** ${toKMB(marketPriceOfBank(loot))} (Average of ${toKMB(marketPriceOfBank(loot) / options.quantity)} per casket)
**Droprates:** ${calcDropRatesFromBankWithoutUniques(loot, options.quantity).slice(0, 20).join(', ')}`,

			files: [image.file]
		};
	}
};
