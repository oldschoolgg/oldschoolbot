import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { GearTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import readableGearTypeName from '../../lib/gear/functions/readableGearTypeName';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { itemNameFromID } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<melee|mage|range|skilling|misc> [quantity:integer{1}] (item:...item)',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(
		msg: KlasaMessage,
		[gearType, quantity = 1, itemArray]: [GearTypes.GearSetupTypes, number, Item[]]
	): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change their gear!`
			);
		}
		const gearTypeSetting = resolveGearTypeSetting(gearType);

		const userBank = msg.author.settings.get(UserSettings.Bank);
		const itemToEquip = itemArray.find(
			i => userBank[i.id] >= quantity && i.equipable_by_player && i.equipment
		);

		if (!itemToEquip) {
			return msg.send(`You don't have enough of this item to equip, or its not equippable.`);
		}

		const { slot } = itemToEquip.equipment!;
		const currentEquippedGear = msg.author.settings.get(gearTypeSetting);

		/**
		 * Handle 2h items
		 */
		if (
			slot === EquipmentSlot.TwoHanded &&
			(currentEquippedGear[EquipmentSlot.Weapon] || currentEquippedGear[EquipmentSlot.Shield])
		) {
			return msg.send(
				`You can't equip this two-handed item because you have items equipped in your weapon/shield slots.`
			);
		}

		if (
			[EquipmentSlot.Weapon, EquipmentSlot.Shield, EquipmentSlot.TwoHanded].includes(slot) &&
			currentEquippedGear[EquipmentSlot.TwoHanded]
		) {
			return msg.send(
				`You can't equip this weapon or shield, because you have a 2H weapon equipped, and need to unequip it first.`
			);
		}

		if (!itemToEquip.stackable && quantity > 1) {
			return msg.send(
				`You can't equip more than 1 of this item at once, as it isn't stackable!`
			);
		}

		/**
		 * If there's already an item equipped in this slot, unequip it,
		 * then recursively call this function again.
		 */
		const equippedInThisSlot = currentEquippedGear[slot];
		if (equippedInThisSlot) {
			const newGear = { ...currentEquippedGear };
			msg.author.log(
				`automatically unequipping ${itemNameFromID(
					newGear[slot]!.item
				)}, so they can equip ${itemToEquip.name}`
			);
			newGear[slot] = null;
			if (slot === (EquipmentSlot.Weapon || EquipmentSlot.TwoHanded)) {
				if (gearType === 'melee') {
					await msg.author.settings.update(UserSettings.Minion.MeleeCombatStyle, null);
				}
				if (gearType === 'range') {
					await msg.author.settings.update(UserSettings.Minion.RangeCombatStyle, null);
				}
				if (gearType === 'mage') {
					await msg.author.settings.update(UserSettings.Minion.MageCombatStyle, null);
				}
			}

			await msg.author.addItemsToBank({
				[equippedInThisSlot.item]: equippedInThisSlot.quantity
			});
			await msg.author.settings.update(gearTypeSetting, newGear);

			return this.run(msg, [gearType, quantity, [itemToEquip]]);
		}

		await msg.author.removeItemFromBank(itemToEquip.id, quantity);
		const newGear = { ...currentEquippedGear };
		newGear[slot] = {
			item: itemToEquip.id,
			quantity
		};

		msg.author.log(`equipping ${quantity}x ${itemToEquip.name}[${itemToEquip.id}]`);

		await msg.author.settings.update(gearTypeSetting, newGear);
		const image = await generateGearImage(
			this.client,
			msg.author,
			msg.author.settings.get(resolveGearTypeSetting(gearType)),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.send(
			`You equipped ${itemToEquip.name} in your ${readableGearTypeName(gearType)} setup.`,
			new MessageAttachment(image, 'osbot.png')
		);
	}
}
