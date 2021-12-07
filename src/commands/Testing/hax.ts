import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BitField, MAX_QP } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { TOBMaxMageGear, TOBMaxMeleeGear, TOBMaxRangeGear } from '../../lib/data/tob';
import { prisma } from '../../lib/settings/prisma';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import { BotCommand } from '../../lib/structures/BotCommand';

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
				.add('Shark', 5000);
			await msg.author.addItemsToBank(loot);
			await msg.author.settings.update(UserSettings.Gear.Melee, TOBMaxMeleeGear);
			await msg.author.settings.update(UserSettings.Gear.Range, TOBMaxRangeGear);
			await msg.author.settings.update(UserSettings.Gear.Mage, TOBMaxMageGear);
			return msg.channel.send(`Gave you ${loot}, all BIS setups`);
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
