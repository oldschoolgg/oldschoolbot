import { Bank, convertLVLtoXP, itemID } from 'oldschooljs';

import { xp_gains_skill_enum } from '@/prisma/main.js';
import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear } from '@/lib/data/cox.js';
import { MAX_QP, quests } from '@/lib/minions/data/quests.js';
import { SlayerRewardsShop } from '@/lib/slayer/slayerUnlocks.js';
import type { SafeUserUpdateInput } from '@/lib/user/update.js';
import { getPOH } from '@/mahoji/lib/abstracted_commands/pohCommand.js';
import { foodPreset, potionsPreset, runePreset, usables } from '@/mahoji/lib/testPotato/presets.js';

export function getMaxUserValues(): SafeUserUpdateInput {
	const updates: SafeUserUpdateInput = {};
	for (const skill of Object.values(xp_gains_skill_enum)) {
		updates[`skills_${skill}`] = convertLVLtoXP(99);
	}
	return {
		minion_hasBought: true,
		QP: MAX_QP,
		slayer_points: 50_000,
		nmz_points: 50_000,
		volcanic_mine_points: 500_000,
		carpenter_points: 5_000_000,
		zeal_tokens: 500_000,
		lms_points: 500_000,
		slayer_unlocks: SlayerRewardsShop.map(i => i.id),
		...updates
	};
}

export async function giveMaxStats(user: MUser) {
	return user.update(getMaxUserValues());
}

export async function maxUser(user: MUser) {
	await getPOH(user.id);
	await prisma.playerOwnedHouse.update({
		where: {
			user_id: user.id
		},
		data: {
			pool: 29_241
		}
	});
	await roboChimpClient.user.upsert({
		where: {
			id: BigInt(user.id)
		},
		create: {
			id: BigInt(user.id),
			leagues_points_balance_osb: 25_000
		},
		update: {
			leagues_points_balance_osb: {
				increment: 25_000
			}
		}
	});
	await user.addItemsToBank({
		items: new Bank()
			.add('Rune pouch')
			.add('Blood rune', 100_000_000)
			.add('Death rune', 100_000_000)
			.add('Blood rune', 100_000_000)
			.add('Water rune', 100_000_000)
			.add('Saradomin brew(4)', 100_000_000)
			.add('Super restore(4)', 100_000_000)
			.add('Stamina potion(4)', 100_000_000)
			.add('Super combat potion(4)', 100_000_000)
			.add('Cooked karambwan', 100_000_000)
			.add('Ranging potion(4)', 100_000_000)
			.add('Coins', 100_000_000)
			.add('Shark', 100_000_000)
			.add('Vial of blood', 100_000_000)
			.add('Rune pouch')
			.add('Zamorakian spear')
			.add('Dragon warhammer')
			.add('Bandos godsword')
			.add('Toxic blowpipe')
			.add(runePreset)
			.add(foodPreset)
			.add(potionsPreset)
			.add(usables)
	});

	await user.updateGear([
		{ setup: 'melee', gear: COXMaxMeleeGear.raw() },
		{ setup: 'range', gear: COXMaxRangeGear.raw() },
		{ setup: 'mage', gear: COXMaxMageGear.raw() }
	]);

	await user.rawUpdate({
		data: {
			GP: 5000000000,
			slayer_points: 100000,
			tentacle_charges: 10000,
			sang_charges: 10000,
			trident_charges: 10000,
			serp_helm_charges: 10000,
			blood_fury_charges: 10000,
			tum_shadow_charges: 10000,
			blood_essence_charges: 10000,
			ash_sanctifier_charges: 10000,
			celestial_ring_charges: 10000,
			scythe_of_vitur_charges: 10000,
			venator_bow_charges: 10000,
			blowpipe: {
				scales: 100000,
				dartQuantity: 100000,
				dartID: itemID('Dragon dart')
			},
			finished_quest_ids: quests.map(q => q.id)
		}
	});
	await giveMaxStats(user);
	return 'Fully maxed your account, stocked your bank, charged all chargeable items.';
}
