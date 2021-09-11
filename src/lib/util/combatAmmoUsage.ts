import { reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { resolveBank } from 'oldschooljs/dist/util';

import { GearSetupType, GearSetupTypes } from '../gear';
import getOSItem from './getOSItem';
import itemID from './itemID';

export const combatItemsConsumption: {
	[key: number]: {
		requiredGearType?: GearSetupType[];
		required: Bank;
		every: number;
		consume: number;
		reductions?: Record<string, number>;
	};
} = {
	[itemID('Hellfire bow')]: {
		requiredGearType: [GearSetupTypes.Wildy],
		required: new Bank({
			'Hellfire arrow': 1
		}),
		every: Time.Minute,
		consume: 1,
		reductions: resolveBank({
			"Ava's assembler": 50,
			'Ranged master cape': 90
		})
	}
};

export default function combatAmmoUsage(options: { duration: number; gearType: GearSetupType; user: KlasaUser }): {
	boosts: string[];
	errors: string[];
	bank: Bank;
} {
	const { user, duration, gearType } = options;
	const boosts = [];
	const errors = [];
	const gear = user.getGear(gearType);
	const toConsume = new Bank();

	for (const [cicItem, cicData] of Object.entries(combatItemsConsumption)) {
		// Ignore this gear, if this boost cant be applied to this gear type
		if (cicData.requiredGearType && !cicData.requiredGearType.includes(gearType)) continue;
		if (gear.hasEquipped([cicItem])) {
			const item = getOSItem(cicItem);
			let requiredBank = cicData.required.clone();
			let toRemove = Math.ceil(duration / cicData.every) * cicData.consume;
			if (cicData.reductions) {
				for (const [reductionItem, reductionPercentage] of Object.entries(cicData.reductions)) {
					const _reductionItem = getOSItem(reductionItem);
					if (gear.hasEquipped([_reductionItem.name])) {
						toRemove = Math.ceil(reduceNumByPercent(toRemove, reductionPercentage));
						boosts.push(
							`${reductionPercentage}% reduction for **${requiredBank
								.items()
								.map((r: [Item, number]) => r[0].name)
								.join(', ')}** by having ${_reductionItem.name} equipped.`
						);
					}
				}
			}
			if (!user.bank().has(requiredBank.multiply(toRemove).bank)) {
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
