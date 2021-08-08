import { objectEntries, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { GearSetupType } from '../gear';
import getOSItem from './getOSItem';
import itemID from './itemID';

export const combatItemsConsumption = {
	[itemID('Hellfire bow')]: {
		required: new Bank().add('Hellfire arrow'),
		every: Time.Minute,
		consume: 3,
		reductions: {
			[itemID("Ava's assembler")]: 50,
			[itemID('Ranged master cape')]: 90
		}
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

	for (const item of gear.allItems()) {
		const _item = getOSItem(item)!;
		const cic = combatItemsConsumption[item];
		if (cic) {
			let requiredBank = cic.required.clone();
			let requiredItems = requiredBank
				.items()
				.map(r => r[0].name)
				.join(', ');
			let toRemove = Math.ceil(duration / cic.every) * cic.consume;
			for (const [reductionItem, reductionPercentage] of objectEntries(cic.reductions)) {
				const _reductionItem = getOSItem(reductionItem)!;
				if (gear.hasEquipped([_reductionItem.name])) {
					toRemove = reduceNumByPercent(toRemove, reductionPercentage);
					boosts.push(
						`${reductionPercentage}% reduction for **${requiredItems}** by having ${_reductionItem.name} equipped.`
					);
				}
			}
			if (!user.bank().has(requiredBank.multiply(toRemove).bank)) {
				errors.push(`You need at least ${requiredBank} to go on a trip using ${_item.name}`);
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
