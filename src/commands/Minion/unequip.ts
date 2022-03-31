import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { GearSetupType, GearSetupTypes, resolveGearTypeSetting } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: `<${GearSetupTypes.join('|')}> (item:...item)`,
			usageDelim: ' ',
			categoryFlags: ['minion'],
			description: 'Unequips items from one of your gear setups.',
			examples: ['+unequip range Twisted bow', '+unequip melee Abyssal whip']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage, [gearType, itemArray]: [GearSetupType, Item[]]): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.channel.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change their gear!`
			);
		}

		const gearTypeSetting = resolveGearTypeSetting(gearType);
		const currentEquippedGear = msg.author.getGear(gearType).raw();

		const itemToUnequip = itemArray.find(i => msg.author.getGear(gearType).hasEquipped([i.id]));

		if (!itemToUnequip) {
			return msg.channel.send("You don't have this item equipped!");
		}

		// it thinks equipment can be null somehow but hasItemEquipped already checks that
		const { slot } = itemToUnequip.equipment!;
		const equippedInThisSlot = currentEquippedGear[slot];
		const newGear = { ...currentEquippedGear };
		newGear[slot] = null;

		await msg.author.addItemsToBank({
			items: {
				[equippedInThisSlot!.item]: equippedInThisSlot!.quantity
			},
			collectionLog: false
		});
		await msg.author.settings.update(gearTypeSetting, newGear);

		const image = await generateGearImage(
			this.client,
			msg.author,
			new Gear(newGear),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.channel.send({
			content: `You unequipped ${itemToUnequip.name} from your ${toTitleCase(gearType)} setup.`,
			files: [image]
		});
	}
}
