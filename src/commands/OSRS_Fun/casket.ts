import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { PerkTier } from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import { BotCommand } from '../../lib/structures/BotCommand';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Workers } from '../../lib/workers';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			aliases: ['clue'],
			usage: '<ClueTier:string> [quantity:int{1}]',
			usageDelim: ' ',
			examples: ['+casket easy 5k', '+casket hard 10'],
			description: 'Simulates opening clue caskets.',
			categoryFlags: ['fun', 'simulation']
		});
	}

	determineLimit(user: KlasaUser) {
		if (this.client.owners.has(user)) {
			return Infinity;
		}

		const perkTier = getUsersPerkTier(user);
		if (perkTier >= PerkTier.Six) {
			return 100_000;
		}

		if (perkTier >= PerkTier.Five) {
			return 80_000;
		}

		if (perkTier >= PerkTier.Four) {
			return 60_000;
		}

		if (perkTier === PerkTier.Three) {
			return 40_000;
		}

		if (perkTier === PerkTier.Two) {
			return 20_000;
		}

		if (perkTier === PerkTier.One) {
			return 1_000;
		}

		return 50;
	}

	async run(msg: KlasaMessage, [tier, quantity = 1]: [string, number]) {
		const limit = this.determineLimit(msg.author);
		if (quantity > limit) {
			return msg.send(
				`The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 100,000 by becoming a patron at <https://www.patreon.com/oldschoolbot>.*`
			);
		}

		const clueTier = clueTiers.find(_tier => _tier.name.toLowerCase() === tier.toLowerCase());

		if (!clueTier) {
			return msg.send(
				`Not a valid clue tier. The valid tiers are: ${clueTiers
					.map(_tier => _tier.name)
					.join(', ')}`
			);
		}

		if (clueTier.name === 'Grandmaster') {
			return msg.send(`Error.`);
		}

		const [loot, title] = await Workers.casketOpen({
			quantity,
			clueTierID: clueTier.id
		});

		if (Object.keys(loot).length === 0) return msg.send(`${title} and got nothing :(`);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(loot.bank, title);

		return msg.send(new MessageAttachment(image!, 'osbot.png'));
	}
}
