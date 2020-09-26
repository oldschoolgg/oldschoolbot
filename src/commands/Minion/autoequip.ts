import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import { addBanks } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { GearTypes } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import resolveGearTypeSetting from '../../lib/gear/functions/resolveGearTypeSetting';
import { GearStat } from '../../lib/gear/types';
import { requiresMinion } from '../../lib/minions/decorators';
import minionNotBusy from '../../lib/minions/decorators/minionNotBusy';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { removeBankFromBank } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage:
				'<melee|mage|range> <attack|defence> <crush|slash|stab|ranged|magic> [prayer|strength]',
			usageDelim: ' ',
			aliases: ['aep']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(
		msg: KlasaMessage,
		[gearType, type, style, extra = null]: [
			GearTypes.GearSetupTypes,
			string,
			string,
			string | null
		]
	) {
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const userGear = msg.author.rawGear()[gearType];
		const newGear = { ...userGear };
		let toAddBank: ItemBank = {};
		let toRemoveBank: ItemBank = {};
		let score2h = 0;
		let score2hExtra = 0;
		let scoreWs = 0;
		let scoreWsExtra = 0;

		// Get primary stat to sort by
		const gearStat: GearStat = `${type}_${style}` as GearStat;
		let gearStatExtra: GearStat | null = null;

		// Get extra settings (prayer or strength)
		switch (extra) {
			case 'strength':
				switch (gearType) {
					case 'melee':
						gearStatExtra = GearStat.MeleeStrength;
						break;
					case 'range':
						gearStatExtra = GearStat.RangedStrength;
						break;
					case 'mage':
						gearStatExtra = GearStat.MagicDamage;
						break;
				}
				break;
			case 'prayer':
				gearStatExtra = GearStat.Prayer;
				break;
		}

		// Init equipables
		const equipables: Record<EquipmentSlot, number[]> = {
			'2h': [],
			ammo: [],
			body: [],
			cape: [],
			feet: [],
			hands: [],
			head: [],
			legs: [],
			neck: [],
			ring: [],
			shield: [],
			weapon: []
		};

		// Read current equipped user gear, removes it and add to bank
		for (const [slot, item] of Object.entries(userGear)) {
			if (item) {
				toAddBank = addBanks([toAddBank, { [item.item]: item.quantity }]);
			}
			newGear[slot as EquipmentSlot] = null;
		}

		// Get all items by slot from user bank
		for (const item of Object.keys(addBanks([userBank, toAddBank]))) {
			const osItem = getOSItem(item);
			if (osItem.equipable_by_player && osItem.equipment && osItem.equipment[gearStat] > 0) {
				equipables[osItem.equipment.slot].push(osItem.id);
			}
		}

		// Sort all slots
		for (const [slot, items] of Object.entries(equipables)) {
			equipables[slot as EquipmentSlot] = items.sort((a, b) => {
				if (gearStatExtra) {
					return (
						getOSItem(b)?.equipment![gearStatExtra] -
							getOSItem(a)?.equipment![gearStatExtra] ||
						getOSItem(b)?.equipment![gearStat] - getOSItem(a)?.equipment![gearStat]
					);
				}
				return getOSItem(b)?.equipment![gearStat] - getOSItem(a)?.equipment![gearStat];
			});
			const item = equipables[slot as EquipmentSlot][0]
				? getOSItem(equipables[slot as EquipmentSlot][0])
				: null;
			if (item !== null) {
				newGear[slot as EquipmentSlot] = item ? { item: item.id, quantity: 1 } : null;
				score2h += slot !== 'weapon' && slot !== 'shield' ? item.equipment![gearStat] : 0;
				scoreWs += slot !== '2h' ? item.equipment![gearStat] : 0;
				if (gearStatExtra) {
					score2hExtra +=
						slot !== 'weapon' && slot !== 'shield' ? item.equipment![gearStatExtra] : 0;
					scoreWsExtra += slot !== '2h' ? item.equipment![gearStatExtra] : 0;
				}
				toRemoveBank = addBanks([toRemoveBank, { [item.id]: 1 }]);
			}
		}

		if (
			(!gearStatExtra && scoreWs > score2h) ||
			(gearStatExtra && scoreWsExtra > score2hExtra)
		) {
			newGear['2h'] = null;
		} else {
			newGear.weapon = null;
			newGear.shield = null;
		}

		// Update the user bank. It adds back what was equipped and then removes what will be equipped
		await msg.author.settings.update(
			UserSettings.Bank,
			removeBankFromBank(addBanks([userBank, toAddBank]), toRemoveBank)
		);
		await msg.author.settings.update(resolveGearTypeSetting(gearType), newGear);
		const image = await generateGearImage(
			this.client,
			msg.author.settings.get(resolveGearTypeSetting(gearType)),
			gearType,
			msg.author.settings.get(UserSettings.Minion.EquippedPet)
		);
		return msg.send(
			`You auto-equipped your best ${style} stat gear for ${type} in your ${gearType} preset.`,
			new MessageAttachment(image, 'osbot.png')
		);
	}
}
