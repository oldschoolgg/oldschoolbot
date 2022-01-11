import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField, MAX_QP } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { TOBMaxMageGear, TOBMaxMeleeGear, TOBMaxRangeGear } from '../../lib/data/tob';
import { prisma } from '../../lib/settings/prisma';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { BotCommand } from '../../lib/structures/BotCommand';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		const paths = Object.values(Skills).map(sk => `skills.${sk.id}`);

		if (msg.flagArgs.t3) {
			await msg.author.settings.update(UserSettings.BitField, BitField.IsPatronTier3);
			return msg.channel.send('Toggled T3 perks.');
		}

		if (msg.flagArgs.tob) {
			const loot = new Bank()
				.add('Saradomin brew(4)', 10_000)
				.add('Super restore(4)', 5000)
				.add('Stamina potion(4)', 1000)
				.add('Super combat potion(4)', 100)
				.add('Cooked karambwan', 1000)
				.add('Ranging potion(4)', 1000)
				.add('Death rune', 10_000)
				.add('Blood rune', 100_000)
				.add('Water rune', 10_000)
				.add('Coins', 5_000_000)
				.add('Shark', 5000)
				.add('Vial of blood', 10_000)
				.add('Rune pouch', 1)
				.add('Toxic blowpipe');
			await msg.author.addItemsToBank(loot);
			await msg.author.settings.update(UserSettings.Blowpipe, {
				scales: 100_000,
				dartQuantity: 100_000,
				dartID: itemID('Rune dart')
			});
			await msg.author.settings.update(UserSettings.Gear.Melee, TOBMaxMeleeGear);
			await msg.author.settings.update(UserSettings.Gear.Range, TOBMaxRangeGear);
			await msg.author.settings.update(UserSettings.Gear.Mage, TOBMaxMageGear);
			await msg.author.settings.update(UserSettings.TentacleCharges, 10_000);
			return msg.channel.send(`Gave you ${loot}, all BIS setups, 10k tentacle charges`);
		}

		msg.author.settings.update(paths.map(path => [path, 14_000_000]));
		msg.author.settings.update(UserSettings.GP, 1_000_000_000);
		msg.author.settings.update(UserSettings.QP, MAX_QP);
		msg.author.settings.update(UserSettings.Slayer.SlayerPoints, 100_000);
		const loot: Record<string, number> = Object.fromEntries(Eatables.map(({ id }) => [id, 1000]));
		const bank = new Bank(loot);
		bank.add('Zamorakian spear');
		bank.add('Dragon warhammer');
		bank.add('Bandos godsword');
		await prisma.playerOwnedHouse.update({
			where: {
				user_id: msg.author.id
			},
			data: {
				pool: 29_241
			}
		});
		msg.author.addItemsToBank(bank.bank);

		return msg.channel.send(
			`Gave you 99 in all skills, 1b GP, ${MAX_QP} QP, and 1k of all eatable foods. **Gave your POH an ornate rejuve pool**`
		);
	}
}
