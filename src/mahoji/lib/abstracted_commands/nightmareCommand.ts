import { reduceNumByPercent, Time } from 'e';
import { Bank } from 'oldschooljs';

import { BitField, PHOSANI_NIGHTMARE_ID, ZAM_HASTA_CRUSH } from '../../../lib/constants';
import { trackLoot } from '../../../lib/lootTrack';
import { NightmareMonster } from '../../../lib/minions/data/killableMonsters';
import { calculateMonsterFood } from '../../../lib/minions/functions';
import hasEnoughFoodForMonster from '../../../lib/minions/functions/hasEnoughFoodForMonster';
import removeFoodFromUser from '../../../lib/minions/functions/removeFoodFromUser';
import { KillableMonster } from '../../../lib/minions/types';
import { Gear } from '../../../lib/structures/Gear';
import { NightmareActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, hasSkillReqs } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../../lib/util/calcMassDurationQuantity';
import { getNightmareGearStats } from '../../../lib/util/getNightmareGearStats';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { hasMonsterRequirements } from '../../mahojiSettings';

async function soloMessage(user: MUser, duration: number, quantity: number, isPhosani: boolean) {
	const name = isPhosani ? "Phosani's Nightmare" : 'The Nightmare';
	const kc = await user.getKC(isPhosani ? PHOSANI_NIGHTMARE_ID : NightmareMonster.id);
	let str = `${user.minionName} is now off to kill ${name} ${quantity} times.`;
	if (kc < 5) {
		str += ` They are terrified to face ${name}, and set off to fight it with great fear.`;
	} else if (kc < 10) {
		str += ` They are scared to face ${name}, but set off with great courage.`;
	} else if (kc < 50) {
		str += ` They are confident in killing ${name}, and prepared for battle.`;
	} else {
		str += ` They are not scared of ${name} anymore, and ready to fight!`;
	}

	return `${str} The trip will take approximately ${formatDuration(duration)}.`;
}

const inquisitorItems = resolveItems([
	"Inquisitor's great helm",
	"Inquisitor's hauberk",
	"Inquisitor's plateskirt",
	"Inquisitor's mace"
]);

export const phosaniBISGear = new Gear({
	head: "Inquisitor's great helm",
	neck: 'Amulet of torture',
	body: "Inquisitor's hauberk",
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: "Inquisitor's plateskirt",
	feet: 'Primordial boots',
	ring: 'Ultor ring',
	weapon: "Inquisitor's mace",
	shield: 'Avernic defender',
	ammo: "Rada's blessing 4"
});

async function checkReqs(
	users: MUser[],
	monster: KillableMonster,
	quantity: number,
	isPhosani: boolean
): Promise<string | undefined> {
	// Check if every user has the requirements for this monster.
	for (const user of users) {
		if (!user.user.minion_hasBought) {
			return `${user.usernameOrMention} doesn't have a minion, so they can't join!`;
		}

		if (user.minionIsBusy) {
			return `${user.usernameOrMention} is busy right now and can't join!`;
		}

		const [hasReqs, reason] = hasMonsterRequirements(user, monster);
		if (!hasReqs) {
			return `${user.usernameOrMention} doesn't have the requirements for this monster: ${reason}`;
		}

		if (!hasEnoughFoodForMonster(monster, user, quantity, users.length)) {
			return `${
				users.length === 1 ? "You don't" : `${user.usernameOrMention} doesn't`
			} have enough food. You need at least ${monster.healAmountNeeded! * quantity} HP in food to ${
				users.length === 1 ? 'start the mass' : 'enter the mass'
			}.`;
		}

		const cost = perUserCost(isPhosani, quantity);
		if (!user.owns(cost)) {
			return `${user.usernameOrMention} doesn't own ${cost}`;
		}

		if (isPhosani) {
			const requirements = hasSkillReqs(user, {
				prayer: 70,
				attack: 90,
				strength: 90,
				defence: 90,
				magic: 90,
				hitpoints: 90
			});
			if (!requirements[0]) {
				return `${user.usernameOrMention} doesn't meet the requirements: ${requirements[1]}`;
			}
			if ((await user.getKC(NightmareMonster.id)) < 50) {
				return "You need to have killed The Nightmare atleast 50 times before you can face the Phosani's Nightmare.";
			}
		}
	}
}

function perUserCost(isPhosani: boolean, quantity: number) {
	const cost = new Bank();
	if (isPhosani) {
		cost.add('Super combat potion(4)', Math.max(1, Math.floor(quantity / 2)))
			.add('Sanfew serum(4)', quantity)
			.add('Super restore(4)', quantity)
			.add('Fire rune', 10 * 70 * quantity)
			.add('Air rune', 7 * 70 * quantity)
			.add('Wrath rune', 70 * quantity);
	}
	return cost;
}

export async function nightmareCommand(user: MUser, channelID: string, name: string) {
	name = name.toLowerCase();
	let isPhosani = false;
	let type: 'solo' | 'mass' = 'solo';
	if (name.includes('phosani')) {
		isPhosani = true;
		type = 'solo';
	} else if (name.includes('mass')) {
		type = 'mass';
	}

	const err = await checkReqs([user], NightmareMonster, 2, isPhosani);
	if (err) return err;

	const users = type === 'mass' ? [user, user, user, user] : [user];
	const soloBoosts: string[] = [];

	let effectiveTime = NightmareMonster.timeToFinish;
	const [data] = await getNightmareGearStats(
		user,
		users.map(u => u.id),
		isPhosani
	);

	const meleeGear = user.gear.melee;

	if (users.length === 1 && isPhosani) {
		if (user.bitfield.includes(BitField.HasSlepeyTablet)) {
			effectiveTime = reduceNumByPercent(effectiveTime, 15);
			soloBoosts.push('15% for Slepey tablet');
		}
		const numberOfBISEquipped = phosaniBISGear
			.allItems(false)
			.filter(itemID => meleeGear.hasEquipped(itemID)).length;
		if (numberOfBISEquipped > 3) {
			effectiveTime = reduceNumByPercent(effectiveTime, numberOfBISEquipped * 1.2);
			soloBoosts.push(`${(numberOfBISEquipped * 1.2).toFixed(2)}% for Melee gear`);
		}
	}

	// Special inquisitor outfit damage boost
	if (meleeGear.hasEquipped(inquisitorItems, true)) {
		effectiveTime *= users.length === 1 ? 0.9 : 0.97;
	} else {
		for (const inqItem of inquisitorItems) {
			if (meleeGear.hasEquipped([inqItem])) {
				effectiveTime *= users.length === 1 ? 0.98 : 0.995;
			}
		}
	}

	// Increase duration for each bad weapon.
	if (data.attackCrushStat < ZAM_HASTA_CRUSH) {
		effectiveTime *= 1.05;
	}

	// Increase duration for lower melee-strength gear.
	if (data.percentMeleeStrength < 40) {
		effectiveTime *= 1.06;
	} else if (data.percentMeleeStrength < 50) {
		effectiveTime *= 1.03;
	} else if (data.percentMeleeStrength < 60) {
		effectiveTime *= 1.02;
	}

	// Increase duration for lower KC.
	if (data.kc < 10) {
		effectiveTime *= 1.15;
	} else if (data.kc < 25) {
		effectiveTime *= 1.05;
	} else if (data.kc < 50) {
		effectiveTime *= 1.02;
	} else if (data.kc < 100) {
		effectiveTime *= 0.98;
	} else {
		effectiveTime *= 0.96;
	}
	if (isPhosani) {
		effectiveTime = reduceNumByPercent(effectiveTime, 31);
		if (user.hasEquippedOrInBank('Dragon claws')) {
			effectiveTime = reduceNumByPercent(effectiveTime, 3);
			soloBoosts.push('3% for Dragon claws');
		}
		if (user.hasEquippedOrInBank("Tumeken's shadow")) {
			effectiveTime = reduceNumByPercent(effectiveTime, 6);
			soloBoosts.push("6% for Tumeken's shadow");
		} else if (user.hasEquippedOrInBank('Harmonised nightmare staff')) {
			effectiveTime = reduceNumByPercent(effectiveTime, 3);
			soloBoosts.push('3% for Harmonised nightmare staff');
		}
		if (user.hasEquippedOrInBank('Elder maul')) {
			effectiveTime = reduceNumByPercent(effectiveTime, 3);
			soloBoosts.push('3% for Elder maul');
		}
	}

	let durQtyRes = await calcDurQty(
		users,
		{ ...NightmareMonster, timeToFinish: effectiveTime },
		undefined,
		Time.Minute * 5,
		Time.Minute * 30
	);
	if (typeof durQtyRes === 'string') return durQtyRes;
	let [quantity, duration, perKillTime] = durQtyRes;

	const secondErr = await checkReqs(users, NightmareMonster, quantity, isPhosani);
	if (secondErr) return secondErr;

	duration = quantity * perKillTime - NightmareMonster.respawnTime!;

	const totalCost = new Bank();
	let soloFoodUsage: Bank | null = null;
	const [healAmountNeeded] = calculateMonsterFood(NightmareMonster, user);
	const cost = perUserCost(isPhosani, quantity);
	if (!user.owns(cost)) {
		return `${user} doesn't own ${cost}.`;
	}
	let healingMod = isPhosani ? 1.5 : 1;
	try {
		const { foodRemoved } = await removeFoodFromUser({
			user,
			totalHealingNeeded: Math.ceil(healAmountNeeded / users.length) * quantity * healingMod,
			healPerAction: Math.ceil(healAmountNeeded / quantity) * healingMod,
			activityName: NightmareMonster.name,
			attackStylesUsed: ['melee']
		});

		const { realCost } = await user.specialRemoveItems(cost);
		soloFoodUsage = realCost.clone().add(foodRemoved);

		totalCost.add(foodRemoved).add(realCost);
	} catch (_err: any) {
		return typeof _err === 'string' ? _err : _err.message;
	}

	await updateBankSetting('nightmare_cost', totalCost);
	await trackLoot({
		id: 'nightmare',
		totalCost,
		type: 'Monster',
		changeType: 'cost',
		users: [
			{
				id: user.id,
				cost: totalCost
			}
		]
	});

	await addSubTaskToActivityTask<NightmareActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Nightmare',
		isPhosani,
		method: type
	});

	const str =
		type === 'solo'
			? `${await soloMessage(user, duration, quantity, isPhosani)}
${soloBoosts.length > 0 ? `**Boosts:** ${soloBoosts.join(', ')}` : ''}
Removed ${soloFoodUsage} from your bank.`
			: `${user.usernameOrMention}'s party of ${
					users.length
			  } is now off to kill ${quantity}x Nightmare. Each kill takes ${formatDuration(
					perKillTime
			  )} instead of ${formatDuration(
					NightmareMonster.timeToFinish
			  )} - the total trip will take ${formatDuration(duration)}.`;

	return str;
}
