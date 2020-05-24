import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import { GearTypes } from '../../lib/gear';
import readableGearTypeName from '../../lib/gear/functions/readableGearTypeName';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { requiresMinion } from '../../lib/minions/decorators';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MessageAttachment } from 'discord.js';

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

	@requiresMinion
	async run(
		msg: KlasaMessage,
		[gearType, itemName]: [GearTypes.GearSetupTypes, string]
	): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			throw `${msg.author.minionName} is currently out on a trip, so you can't change their gear!`;
		}

		const gearTypeSetting = resolveGearTypeSetting(gearType);

		const itemToEquip = getOSItem(itemName);
		if (!itemToEquip.equipable_by_player || !itemToEquip.equipment) {
			throw `This item isn't equippable.`;
		}

		const { slot } = itemToEquip.equipment;
		const currentEquippedGear = msg.author.settings.get(gearTypeSetting);

		const equippedInThisSlot = currentEquippedGear[slot];
		if (!equippedInThisSlot) throw `You have nothing equipped in this slot.`;
		if (equippedInThisSlot.item !== itemToEquip.id) {
			throw `You don't have a ${itemToEquip.name} equipped.`;
		}
		const newGear = { ...currentEquippedGear };
		newGear[slot] = null;

		await msg.author.addItemsToBank({
			[equippedInThisSlot.item]: equippedInThisSlot.quantity
		});
		await msg.author.settings.update(gearTypeSetting, newGear);

		const image = await generateGearImage(
			this.client,
			msg.author.settings.get(resolveGearTypeSetting(gearType)),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.send(
			`You unequipped ${itemToEquip.name} from your ${readableGearTypeName(gearType)} setup.`,
			new MessageAttachment(image, 'osbot.png')
		);
	}
}
