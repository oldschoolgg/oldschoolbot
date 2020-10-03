import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { GearTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';
import readableGearTypeName from '../../lib/gear/functions/readableGearTypeName';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc> (item:...item)',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(
		msg: KlasaMessage,
		[gearType, itemArray]: [GearTypes.GearSetupTypes, Item[]]
	): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			throw `${msg.author.minionName} is currently out on a trip, so you can't change their gear!`;
		}

		const gearTypeSetting = resolveGearTypeSetting(gearType);
		const currentEquippedGear = msg.author.settings.get(gearTypeSetting);

		const itemToUnequip = itemArray.find(i => hasItemEquipped(i.id, currentEquippedGear));

		if (!itemToUnequip) {
			throw `You don't have this item equipped!`;
		}

		// it thinks equipment can be null somehow but hasItemEquipped already checks that
		const { slot } = itemToUnequip.equipment!;
		const equippedInThisSlot = currentEquippedGear[slot];
		const newGear = { ...currentEquippedGear };
		newGear[slot] = null;

		await msg.author.addItemsToBank({
			[equippedInThisSlot!.item]: equippedInThisSlot!.quantity
		});
		await msg.author.settings.update(gearTypeSetting, newGear);

		const image = await generateGearImage(
			this.client,
			msg.author,
			msg.author.settings.get(resolveGearTypeSetting(gearType)),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.send(
			`You unequipped ${itemToUnequip.name} from your ${readableGearTypeName(
				gearType
			)} setup.`,
			new MessageAttachment(image, 'osbot.png')
		);
	}
}
