import { Time, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import type { GearSetupType } from '../gear';
import getOSItem from './getOSItem';

interface CombatItemConsumption {
	requiredGearType: GearSetupType[];
	required: Bank;
	every: number;
	consume: number;
	reductions: Bank;
	item: Item;
}

export const combatItemsConsumption: CombatItemConsumption[] = [
	{
		requiredGearType: ['wildy'],
		required: new Bank({
			'Hellfire arrow': 1
		}),
		every: Time.Minute,
		consume: 1,
		reductions: new Bank({
			"Ava's assembler": 50,
			'Ranged master cape': 90
		}),
		item: getOSItem('Hellfire bow')
	}
];

export default function combatAmmoUsage(options: { duration: number; gearType: GearSetupType; user: MUser }): {
	boosts: string[];
	errors: string[];
	bank: Bank;
} {
	const { user, duration, gearType } = options;
	const boosts = [];
	const errors = [];
	const gear = user.gear[gearType];
	const toConsume = new Bank();

	for (const { item, requiredGearType, every, reductions, required, consume } of combatItemsConsumption) {
		// Ignore this gear, if this boost cant be applied to this gear type
		if (requiredGearType && !requiredGearType.includes(options.gearType)) continue;
		if (gear.hasEquipped(item.name)) {
			const requiredBank = required.clone();
			let toRemove = Math.ceil(duration / every) * consume;
			if (reductions) {
				for (const [reductionItem, reductionPercentage] of reductions.items()) {
					if (gear.hasEquipped(reductionItem.name)) {
						toRemove = Math.ceil(reduceNumByPercent(toRemove, reductionPercentage));
						boosts.push(
							`${reductionPercentage}% reduction for **${requiredBank
								.items()
								.map((r: [Item, number]) => r[0].name)
								.join(', ')}** by having ${reductionItem.name} equipped.`
						);
					}
				}
			}
			if (!user.bank.has(requiredBank.multiply(toRemove).bank)) {
				errors.push(`You need at least ${requiredBank} to go on a trip using ${item.name}`);
			}
			toConsume.add(requiredBank);
		}
	}

	return {
		boosts,
		errors,
		bank: toConsume
	};
}
