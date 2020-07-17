import { KlasaUser, KlasaMessage, Command, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { Openables } from 'oldschooljs';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { PerkTier } from '../../lib/constants';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			aliases: ['chest'],
			usage: '<quantity:int{1}> [fishlvl:int{1}] <chestName:...string>',
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

	async run(msg: KlasaMessage, [quantity = 1, fishlvl = 1, chestName]: [number, number, string]) {
		const limit = this.determineLimit(msg.author);
		if (quantity > limit) {
			throw `The quantity you gave exceeds your limit of ${limit.toLocaleString()}! *You can increase your limit by up to 50,000 by becoming a patron at <https://www.patreon.com/oldschoolbot>.*`;
		}

		chestName.toLowerCase();
		const chest = Openables.find(
			_chestName =>
				_chestName.aliases.some(alias => alias.toLowerCase() === chestName) ||
				_chestName.name === chestName
		);

		if (
			!chest ||
			chest.id === Openables.SeedPack.id ||
			chest.id === Openables.LuckyImp.id ||
			chest.id === Openables.MysteryBox.id
		) {
			throw `Not a valid chest name. The valid chests are: Bronze HAM chest, Iron HAM chest, Silver HAM chest, Steel HAM chest, Crystal chest, Elven crystal chest, Grubby chest, Muddy chest, Ogre coffin, Sinister chest, Brimstone chest, Larran's big chest and Larran's small chest.`;
		}
		let loot;

		switch (true) {
			case chest.id === Openables.BrimstoneChest.id: {
				loot = Openables.BrimstoneChest.open(fishlvl, quantity);
				break;
			}
			case chest.id === Openables.LarransChest.id: {
				if (chest.name.indexOf('big') > -1) {
					loot = Openables.LarransChest.open(fishlvl, 'big', quantity);
				} else {
					loot = Openables.LarransChest.open(fishlvl, 'small', quantity);
				}
				break;
			}
			default: {
				loot = chest.open(quantity, chest);
				break;
			}
		}

		const opened = `You opened ${quantity} ${chest.name}${quantity > 1 ? 's' : ''}:`;

		if (Object.keys(loot).length === 0) return msg.send(`${opened} and got nothing :(`);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot from ${quantity} ${chest.name}${quantity > 1 ? 's' : ''}:`
			);

		return msg.send(new MessageAttachment(image, 'osbot.png'));
	}
}
