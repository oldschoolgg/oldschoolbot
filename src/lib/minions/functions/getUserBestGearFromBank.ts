import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';
import { addBanks, removeItemFromBank } from 'oldschooljs/dist/util';

import { GearSetupTypes, GearStat } from '../../gear/types';
import { Gear } from '../../structures/Gear';
import { ItemBank, Skills } from '../../types';
import { removeBankFromBank, skillsMeetRequirements } from '../../util';
import getOSItem from '../../util/getOSItem';

function getItemScore(item: Item) {
	return Object.values(item.equipment!).reduce(
		(a, b) => (!isNaN(Number(a)) ? Number(a) : 0) + (!isNaN(Number(b)) ? Number(b) : 0),
		0
	);
}

export default function getUserBestGearFromBank(
	userBank: ItemBank,
	userGear: Gear,
	gearType: GearSetupTypes,
	skills: Skills,
	type: string,
	style: string,
	extra: string | null = null
) {
	let toRemoveFromGear: ItemBank = {};
	let toRemoveFromBank: ItemBank = {};
	const gearToEquip = { ...userGear.raw() };

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
				case GearSetupTypes.Skilling:
				case GearSetupTypes.Misc:
					break;
				case GearSetupTypes.Melee:
					gearStatExtra = GearStat.MeleeStrength;
					break;
				case GearSetupTypes.Range:
					gearStatExtra = GearStat.RangedStrength;
					break;
				case GearSetupTypes.Mage:
					gearStatExtra = GearStat.MagicDamage;
					break;
				case GearSetupTypes.Wildy:
					break;
			}
			break;
		case 'prayer':
			gearStatExtra = GearStat.Prayer;
			break;
		default:
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
	for (const [slot, item] of Object.entries(userGear.raw())) {
		if (item) {
			toRemoveFromGear = addBanks([toRemoveFromGear, { [item.item]: item.quantity }]);
		}
		gearToEquip[slot as EquipmentSlot] = null;
	}

	// Get all items by slot from user bank
	for (const [_item, quantity] of Object.entries(addBanks([userBank, toRemoveFromGear]))) {
		const item = getOSItem(_item);
		const hasStats = item.equipment?.requirements
			? skillsMeetRequirements(skills, item.equipment.requirements)
			: true;
		if (item.equipable_by_player && item.equipment && item.equipment[gearStat] >= 0 && quantity > 0 && hasStats) {
			equipables[item.equipment.slot].push(item.id);
		}
	}

	// Sort all slots
	for (const [slot, items] of Object.entries(equipables)) {
		if (equipables[slot as EquipmentSlot][0]) {
			// Sort by the extra gear first if that is set
			equipables[slot as EquipmentSlot] = items.sort((a, b) => {
				const itemA = getOSItem(a);
				const itemB = getOSItem(b);
				const aGearScore = getItemScore(itemA);
				const bGearScore = getItemScore(itemB);
				if (gearStatExtra) {
					return (
						itemB.equipment![gearStatExtra] - itemA.equipment![gearStatExtra] ||
						itemB.equipment![gearStat] - itemA.equipment![gearStat] ||
						bGearScore - aGearScore
					);
				}
				return itemB.equipment![gearStat] - itemA.equipment![gearStat] || bGearScore - aGearScore;
			});

			// Get the best item (first in slot) and if that exists, add its stats to the calculation
			const item = getOSItem(equipables[slot as EquipmentSlot][0]);
			gearToEquip[slot as EquipmentSlot] = { item: item.id, quantity: 1 };
			score2h += slot !== 'weapon' && slot !== 'shield' ? item.equipment![gearStat] : 0;
			scoreWs += slot !== '2h' ? item.equipment![gearStat] : 0;
			if (gearStatExtra) {
				score2hExtra += slot !== 'weapon' && slot !== 'shield' ? item.equipment![gearStatExtra] : 0;
				scoreWsExtra += slot !== '2h' ? item.equipment![gearStatExtra] : 0;
			}
			toRemoveFromBank = addBanks([toRemoveFromBank, { [item.id]: 1 }]);
		}
	}

	// Removes weapon/shield or 2h, depending on what has the highest stats
	if ((!gearStatExtra && scoreWs > score2h) || (gearStatExtra && scoreWsExtra > score2hExtra)) {
		if (gearToEquip['2h']) {
			toRemoveFromBank = removeItemFromBank(
				toRemoveFromBank,
				gearToEquip['2h']!.item,
				gearToEquip['2h']!.quantity
			);
			gearToEquip['2h'] = null;
		}
	} else {
		if (gearToEquip.weapon) {
			toRemoveFromBank = removeItemFromBank(
				toRemoveFromBank,
				gearToEquip.weapon!.item,
				gearToEquip.weapon!.quantity
			);
			gearToEquip.weapon = null;
		}
		if (gearToEquip.shield) {
			toRemoveFromBank = removeItemFromBank(
				toRemoveFromBank,
				gearToEquip.shield!.item,
				gearToEquip.shield!.quantity
			);
			gearToEquip.shield = null;
		}
	}

	// Remove items that are already equipped from being added to bank and re-equipped
	for (const item of Object.keys(toRemoveFromGear)) {
		if (toRemoveFromBank[Number(item)]) {
			delete toRemoveFromGear[Number(item)];
			delete toRemoveFromBank[Number(item)];
		}
	}

	return {
		toRemoveFromGear,
		toRemoveFromBank,
		gearToEquip,
		userFinalBank: removeBankFromBank(addBanks([userBank, toRemoveFromGear]), toRemoveFromBank)
	};
}
