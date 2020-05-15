import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { GearTypes } from '../../lib/gear';
import readableGearTypeName from '../../lib/gear/functions/readableGearTypeName';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import getOSItemsArray from '../../lib/util/getOSItemsArray';
import { Item } from 'oldschooljs/dist/meta/types';
import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc> <itemName:...string>',
			usageDelim: ' '
		});
	}

	async run(
		msg: KlasaMessage,
		[gearType, itemName]: [GearTypes.GearSetupTypes, string]
	): Promise<KlasaMessage> {
		const gearTypeSetting = resolveGearTypeSetting(gearType);
		const currentEquippedGear = msg.author.settings.get(gearTypeSetting);

		const osItemsArray = getOSItemsArray(itemName) as Item[];
		const itemToEquip = osItemsArray.find(i => hasItemEquipped(i.id, currentEquippedGear));

		if (!itemToEquip) {
			throw `You don't have this item equipped!`;
		}

		// it thinks equipment can be null somehow but hasItemEquipped already checks that
		const { slot } = itemToEquip.equipment!;
		const equippedInThisSlot = currentEquippedGear[slot];
		const newGear = { ...currentEquippedGear };
		newGear[slot] = null;

		await msg.author.addItemsToBank({
			[equippedInThisSlot!.item]: equippedInThisSlot!.quantity
		});
		await msg.author.settings.update(gearTypeSetting, newGear);

		return msg.send(
			`You unequipped ${itemToEquip.name} from your ${readableGearTypeName(gearType)} setup.`
		);
	}
}
