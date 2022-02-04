import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import { PATRON_ONLY_GEAR_SETUP, PerkTier } from '../../lib/constants';
import { GearSetupType, GearSetupTypes, resolveGearTypeSetting } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatSkillRequirements, itemNameFromID, skillsMeetRequirements, toTitleCase } from '../../lib/util';

export const WILDY_PRESET_WARNING_MESSAGE =
	"You are equipping items to your **wilderness** setup. *Every* item in this setup can potentially be lost if you're doing activities in the wilderness. Are you sure you want to equip it?";

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: `<${GearSetupTypes.join('|')}> [quantity:integer{1}] (item:...item)`,
			usageDelim: ' ',
			description: 'Equips an item to one of your gear setups. (melee/range/range/skilling/misc)',
			examples: ['+equip skilling graceful hood', '+equip melee bandos godsword', '+equip mage staff of fire'],
			categoryFlags: ['minion']
		});
	}

	@requiresMinion
	async run(
		msg: KlasaMessage,
		[gearType, quantity = 1, itemArray]: [GearSetupType, number, Item[]]
	): Promise<KlasaMessage> {
		if (msg.author.minionIsBusy) {
			return msg.channel.send(
				`${msg.author.minionName} is currently out on a trip, so you can't change their gear!`
			);
		}
		const gearTypeSetting = resolveGearTypeSetting(gearType);

		const userBank = msg.author.settings.get(UserSettings.Bank);
		const itemToEquip = itemArray.find(i => userBank[i.id] >= quantity && i.equipable_by_player && i.equipment);

		if (!itemToEquip) {
			return msg.channel.send("You don't have enough of this item to equip, or its not equippable.");
		}

		const { slot } = itemToEquip.equipment!;
		const currentEquippedGear = msg.author.getGear(gearType).raw();

		if (gearType === 'other' && msg.author.perkTier < PerkTier.Four) {
			return msg.channel.send(PATRON_ONLY_GEAR_SETUP);
		}

		/**
		 * Handle 2h items
		 */
		if (
			slot === EquipmentSlot.TwoHanded &&
			(currentEquippedGear[EquipmentSlot.Weapon] || currentEquippedGear[EquipmentSlot.Shield])
		) {
			return msg.channel.send(
				"You can't equip this two-handed item because you have items equipped in your weapon/shield slots."
			);
		}

		if (
			[EquipmentSlot.Weapon, EquipmentSlot.Shield, EquipmentSlot.TwoHanded].includes(slot) &&
			currentEquippedGear[EquipmentSlot.TwoHanded]
		) {
			return msg.channel.send(
				"You can't equip this weapon or shield, because you have a 2H weapon equipped, and need to unequip it first."
			);
		}

		if (!itemToEquip.stackable && quantity > 1) {
			return msg.channel.send("You can't equip more than 1 of this item at once, as it isn't stackable!");
		}

		if (itemToEquip.equipment?.requirements) {
			if (!skillsMeetRequirements(msg.author.rawSkills, itemToEquip.equipment.requirements)) {
				return msg.channel.send(
					`You can't equip a ${
						itemToEquip.name
					} because you don't have the required stats: ${formatSkillRequirements(
						itemToEquip.equipment.requirements
					)}.`
				);
			}
		}

		if (gearType === 'wildy') {
			await msg.confirm(WILDY_PRESET_WARNING_MESSAGE);
		}
		/**
		 * If there's already an item equipped in this slot, unequip it,
		 * then recursively call this function again.
		 */
		const equippedInThisSlot = currentEquippedGear[slot];
		if (equippedInThisSlot) {
			const newGear = { ...currentEquippedGear };
			msg.author.log(
				`automatically unequipping ${itemNameFromID(newGear[slot]!.item)}, so they can equip ${
					itemToEquip.name
				}`
			);
			newGear[slot] = null;

			await msg.author.addItemsToBank({
				items: {
					[equippedInThisSlot.item]: equippedInThisSlot.quantity
				}
			});
			await msg.author.settings.update(gearTypeSetting, newGear);
			msg.flagArgs.cf = '1';
			return this.run(msg, [gearType, quantity, [itemToEquip]]);
		}

		await msg.author.removeItemsFromBank(new Bank().add(itemToEquip.id, quantity));

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
			msg.author.getGear(gearType),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);

		return msg.channel.send({
			content: `You equipped ${itemToEquip.name} in your ${toTitleCase(gearType)} setup.`,
			files: [new MessageAttachment(image, 'osbot.png')]
		});
	}
}
