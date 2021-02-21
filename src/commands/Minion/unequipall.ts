import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { defaultGear, GearSetupTypes, resolveGearTypeSetting } from '../../lib/gear';
import { requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc>',
			usageDelim: ' ',
			description:
				'Unequips everything from one of your gear setups. (melee/range/range/skilling/misc)',
			examples: ['+unequipall melee'],
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [gearType]: [GearSetupTypes]): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change their gear!`
			);
		}
		const gearTypeSetting = resolveGearTypeSetting(gearType);
		const currentEquippedGear = msg.author.getGear(gearType);

		let refund = new Bank();
		for (const val of Object.values(currentEquippedGear)) {
			if (!val) continue;
			refund.add(val.item, val.quantity);
		}
		if (refund.length === 0) {
			return msg.send(`You have no items in your ${toTitleCase(gearType)} setup.`);
		}

		await msg.author.settings.update(gearTypeSetting, defaultGear);

		await msg.author.addItemsToBank(refund.bank);
		return msg.send(
			`You unequipped all items (${refund}) from your ${toTitleCase(gearType)} setup.`
		);
	}
}
