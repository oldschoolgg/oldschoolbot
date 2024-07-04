import { Bank } from 'oldschooljs';
import type { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import type { GearSetupType } from '../../gear/types';
import { GearStat } from '../../gear/types';
import type { Gear } from '../../structures/Gear';
import type { Skills } from '../../types';
import { assert, skillsMeetRequirements } from '../../util';
import getOSItem from '../../util/getOSItem';

function getItemScore(item: Item) {
	return Object.values(item.equipment!).reduce(
		(a, b) => (!Number.isNaN(Number(a)) ? Number(a) : 0) + (!Number.isNaN(Number(b)) ? Number(b) : 0),
		0
	);
}

export default function getUserBestGearFromBank(
	userBank: Bank,
	userGear: Gear,
	gearType: GearSetupType,
	skills: Skills,
	gearStat: GearStat,
	extra: string | null = null
) {
	assert(Object.values(GearStat).includes(gearStat as any));
	const toRemoveFromGear: Bank = new Bank();
	const toRemoveFromBank: Bank = new Bank();
	const gearToEquip = { ...userGear.raw() };

	let score2h = 0;
	let score2hExtra = 0;
	let scoreWs = 0;
	let scoreWsExtra = 0;

	// Get primary stat to sort by
	let gearStatExtra: GearStat | null = null;

	// Get extra settings (prayer or strength)
	switch (extra) {
		case 'strength':
			switch (gearType) {
				case 'skilling':
				case 'misc':
				case 'fashion':
				case 'other':
					break;
				case 'melee':
					gearStatExtra = GearStat.MeleeStrength;
					break;
				case 'range':
					gearStatExtra = GearStat.RangedStrength;
					break;
				case 'mage':
					gearStatExtra = GearStat.MagicDamage;
					break;
				case 'wildy':
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
			toRemoveFromGear.add(item.item, item.quantity);
		}
		gearToEquip[slot as EquipmentSlot] = null;
	}

	// Get all items by slot from user bank
	for (const [item, quantity] of new Bank().add(userBank).add(toRemoveFromGear).items()) {
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
			toRemoveFromBank.add(item.id, 1);
		}
	}

	// Removes weapon/shield or 2h, depending on what has the highest stats
	if ((!gearStatExtra && scoreWs > score2h) || (gearStatExtra && scoreWsExtra > score2hExtra)) {
		if (gearToEquip['2h']) {
			toRemoveFromBank.remove(gearToEquip['2h']?.item, gearToEquip['2h']?.quantity);
			gearToEquip['2h'] = null;
		}
	} else {
		if (gearToEquip.weapon) {
			toRemoveFromBank.remove(gearToEquip.weapon?.item, gearToEquip.weapon?.quantity);
			gearToEquip.weapon = null;
		}
		if (gearToEquip.shield) {
			toRemoveFromBank.remove(gearToEquip.shield?.item, gearToEquip.shield?.quantity);
			gearToEquip.shield = null;
		}
	}

	// Remove items that are already equipped from being added to bank and re-equipped
	for (const [item] of toRemoveFromGear.items()) {
		if (toRemoveFromBank.has(item.id)) {
			if (toRemoveFromGear.has(item.id)) {
				// Don't delete all if there's more than 1 (stackables)
				toRemoveFromGear.remove(item.id, 1);
			} else {
				toRemoveFromGear.remove(item.id, toRemoveFromGear.amount(item.id));
			}
			toRemoveFromBank.remove(item.id, toRemoveFromBank.amount(item.id));
		}
	}

	return {
		toRemoveFromGear,
		toRemoveFromBank,
		gearToEquip,
		userFinalBank: new Bank(userBank).add(toRemoveFromGear).remove(toRemoveFromBank)
	};
}
