import { MessageAttachment } from 'discord.js';
import { Command, CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Misc } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import { addBanks, roll } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

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

		if (perkTier >= PerkTier.Four) {
			return 100_000;
		}

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

		let loot = clueTier.table.open(quantity);
		let mimicNumber = 0;
		if (clueTier.mimicChance) {
			for (let i = 0; i < quantity; i++) {
				if (roll(clueTier.mimicChance)) {
					loot = addBanks([Misc.Mimic.open(clueTier.name as 'master' | 'elite'), loot]);
					mimicNumber++;
				}
			}
		}

		const opened = `You opened ${quantity} ${clueTier.name} 
		Clue Casket${quantity > 1 ? 's' : ''}
		${
			mimicNumber > 0
				? ` and defeated ${mimicNumber} 
					mimic${mimicNumber > 1 ? 's' : ''}`
				: ''
		}`;

		if (Object.keys(loot).length === 0) return msg.send(`${opened} and got nothing :(`);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot from ${quantity} ${clueTier.name} Clue${quantity > 1 ? 's' : ''}${
					mimicNumber > 0 ? ` with ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''
				}`
			);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
