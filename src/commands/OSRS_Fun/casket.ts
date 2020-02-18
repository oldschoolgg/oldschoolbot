import { KlasaUser, KlasaMessage, Command, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';

import clueTiers from '../../lib/clueTiers';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { PerkTier } from '../../lib/constants';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			aliases: ['clue'],
			usage: '<ClueTier:string> [quantity:int{1}]',
			usageDelim: ' '
		});
	}

	determineLimit(user: KlasaUser) {
		if (this.client.owners.has(user)) {
			return Infinity;
		}

		const perkTier = getUsersPerkTier(user);

		if (perkTier === PerkTier.Three) {
			return 50_000;
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
			throw `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit to 10,000 by nitro boosting in the support server.*`;
		}

		const clueTier = clueTiers.find(_tier => _tier.name.toLowerCase() === tier.toLowerCase());

		if (!clueTier) {
			throw `Not a valid clue tier. The valid tiers are: ${clueTiers
				.map(_tier => _tier.name)
				.join(', ')}`;
		}

		const loot = clueTier.table.open(quantity);

		const opened = `You opened ${quantity} ${clueTier.name} Clue Casket${
			quantity > 1 ? 's' : ''
		}`;

		if (Object.keys(loot).length === 0) return msg.send(`${opened} and got nothing :(`);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(loot, `Loot from ${quantity} ${clueTier.name} Clues`);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
