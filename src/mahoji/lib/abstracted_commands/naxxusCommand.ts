import { EmbedBuilder } from 'discord.js';
import { calcPercentOfNum, calcWhatPercent, increaseNumByPercent, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import { checkUserCanUseDegradeableItem, degradeItem, degradeablePvmBoostItems } from '../../../lib/degradeableItems';
import type { GearStats } from '../../../lib/gear';
import { trackLoot } from '../../../lib/lootTrack';
import { NAXXUS_HP, Naxxus } from '../../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { Gear } from '../../../lib/structures/Gear';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration, isWeekend } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { hasMonsterRequirements } from '../../mahojiSettings';

const bisMageGear = new Gear({
	head: 'Gorajan occult helmet', // 20
	body: 'Gorajan occult top', // 45
	legs: 'Gorajan occult legs', // 40
	hands: 'Gorajan occult gloves', // 22
	feet: 'Gorajan occult boots', // 22
	cape: 'Vasa cloak', // 38
	ring: 'Spellbound ring(i)', // 25
	weapon: 'Void staff', // 250
	shield: 'Abyssal tome', // 45
	neck: 'Arcane blast necklace' // 25
});

const bisMeleeGear = new Gear({
	head: 'Gorajan warrior helmet',
	body: 'Gorajan warrior top',
	legs: 'Gorajan warrior legs',
	hands: 'Gorajan warrior gloves',
	feet: 'Gorajan warrior boots',
	neck: "Brawler's hook necklace",
	cape: 'TzKal cape',
	weapon: 'Drygore rapier',
	shield: 'Offhand spidergore rapier',
	ring: 'Ignis ring(i)'
});

const itemBoosts: {
	item: Item;
	boost: number;
	setup: 'mage' | 'melee';
}[] = [
	{
		item: getOSItem('Void staff'),
		boost: 10,
		setup: 'mage'
	},
	{
		item: getOSItem('Abyssal tome'),
		boost: 7.5,
		setup: 'mage'
	},
	{
		item: getOSItem('Tzkal cape'),
		boost: 5,
		setup: 'melee'
	},
	{
		item: getOSItem('Vasa cloak'),
		boost: 5,
		setup: 'mage'
	},
	{
		item: getOSItem('Ignis ring(i)'),
		boost: 2.5,
		setup: 'melee'
	},
	{
		item: getOSItem('Spellbound ring(i)'),
		boost: 2.5,
		setup: 'mage'
	},
	{
		item: getOSItem('Spellbound ring'),
		boost: 2,
		setup: 'mage'
	}
];

const naxxusKcBoosts: [number, number, string | null][] = [
	[500, 20, null],
	[400, 15, null],
	[300, 10, null],
	[200, 7.5, null],
	[100, 5, null],
	[0, -15, '< 100']
];

function calcSetupPercent(
	maxStats: GearStats,
	userStats: GearStats,
	heavyPenalizeStat: keyof GearStats,
	ignoreStats: (keyof GearStats)[]
) {
	let numKeys = 0;
	let totalPercent = 0;
	for (const [key, val] of Object.entries(maxStats) as [keyof GearStats, number][]) {
		if (val <= 0 || ignoreStats.includes(key)) continue;
		const rawPercent = Math.min(100, calcWhatPercent(userStats[key], val));
		totalPercent += rawPercent;
		numKeys++;
	}
	totalPercent /= numKeys;
	// Heavy penalize for having less than 50% in the main stat of this setup.
	if (userStats[heavyPenalizeStat] < maxStats[heavyPenalizeStat] / 2) {
		totalPercent = Math.floor(Math.max(0, totalPercent / 2));
	}
	return totalPercent;
}

export async function naxxusCommand(user: MUser, channelID: string, quantity: number | undefined) {
	const [hasReqs, rejectReason] = hasMonsterRequirements(user, Naxxus);
	if (!hasReqs) {
		return `${user.usernameOrMention} doesn't have the requirements for this monster: ${rejectReason}`;
	}

	const boosts = [];
	let effectiveTime = Naxxus.timeToFinish;
	if (isWeekend()) {
		effectiveTime = reduceNumByPercent(effectiveTime, 5);
		boosts.push('5% Weekend boost');
	}

	const naxxusKc = await user.getKC(Naxxus.id);
	for (const [threshold, boost, subThreshold] of naxxusKcBoosts) {
		if (naxxusKc >= threshold) {
			if (boost < 0) {
				effectiveTime = increaseNumByPercent(effectiveTime, Math.abs(boost));
			} else {
				effectiveTime = reduceNumByPercent(effectiveTime, boost);
			}
			boosts.push(`${boost}% for ${subThreshold ?? `> ${threshold}`} KC`);
			break;
		}
	}

	const mage = calcSetupPercent(bisMageGear.stats, user.gear.mage.stats, 'attack_magic', [
		'attack_stab',
		'attack_slash',
		'attack_crush',
		'attack_ranged',
		'defence_crush',
		'defence_ranged',
		'defence_slash',
		'defence_stab'
	]);

	const melee = calcSetupPercent(bisMeleeGear.stats, user.gear.melee.stats, 'attack_stab', [
		'attack_slash',
		'attack_crush',
		'attack_ranged',
		'attack_magic',
		'defence_magic'
	]);

	const totalGearPercent = (melee + mage) / 2;
	const speedReductionMaxPercent = 15;
	effectiveTime = reduceNumByPercent(
		effectiveTime,
		calcPercentOfNum(Math.ceil(totalGearPercent), speedReductionMaxPercent)
	);
	boosts.push(
		`${calcPercentOfNum(Math.ceil(totalGearPercent), speedReductionMaxPercent)}% gear stats [${Math.ceil(
			melee
		)}% of max melee, ${Math.ceil(mage)}% of max mage]`
	);

	for (const itemBoost of itemBoosts) {
		if (user.gear[itemBoost.setup].hasEquipped(itemBoost.item.id)) {
			effectiveTime = reduceNumByPercent(effectiveTime, itemBoost.boost);
			boosts.push(`${itemBoost.boost}% ${itemBoost.item.name}`);
		}
	}

	const maxTripLength = calcMaxTripLength(user, 'Naxxus');
	// If no quantity provided, set it to the max.
	if (quantity === undefined) {
		quantity = Math.max(1, Math.floor(maxTripLength / effectiveTime));
	}
	if (quantity > 1 && quantity * effectiveTime > maxTripLength) {
		return `The max number of Naxxus you can do is ${Math.floor(maxTripLength / effectiveTime)}!`;
	}

	const kc = await user.getKC(Naxxus.id);
	let brewsNeeded = 10;
	if (kc > 500) brewsNeeded *= 0.2;
	else if (kc > 400) brewsNeeded *= 0.4;
	else if (kc > 300) brewsNeeded *= 0.6;
	else if (kc > 200) brewsNeeded *= 0.8;

	brewsNeeded = Math.ceil(quantity * brewsNeeded);

	const foodBank = new Bank()
		.add('Enhanced saradomin brew', brewsNeeded)
		.add('Enhanced super restore', Math.floor(brewsNeeded / 3) < 1 ? 1 : Math.floor(brewsNeeded / 3))
		.add('Enhanced divine water', 2);

	if (!user.owns(foodBank)) {
		return `${user.usernameOrMention} doesn't have the food requirements for this monster: ${foodBank}`;
	}

	const duration = effectiveTime * quantity;
	// Some degrading items use charges based on DURATION
	// It is important this is after duration modifiers so that the item isn't over-charged
	for (const degItem of degradeablePvmBoostItems) {
		if (
			user.gear[degItem.degradeable.setup].hasEquipped(degItem.item.name) &&
			['melee', 'mage'].includes(degItem.degradeable.setup)
		) {
			const chargesNeeded = degItem.charges({ totalHP: NAXXUS_HP * quantity, duration, user });
			const res = checkUserCanUseDegradeableItem({
				item: degItem.item,
				chargesToDegrade: chargesNeeded,
				user
			});
			if (!res.hasEnough) {
				return res.userMessage;
			}
			await degradeItem({
				item: degItem.item,
				chargesToDegrade: chargesNeeded,
				user
			});
		}
	}

	await user.removeItemsFromBank(foodBank);

	await trackLoot({
		changeType: 'cost',
		totalCost: foodBank,
		id: Naxxus.name,
		type: 'Monster',
		users: [
			{
				id: user.id,
				cost: foodBank
			}
		]
	});

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Naxxus'
	});

	updateBankSetting('naxxus_cost', foodBank);

	const embed = new EmbedBuilder()
		.setDescription(
			`**Supplies**: ${foodBank.toString()}.
${boosts.length > 0 ? `**Boosts:** ${boosts.join(', ')}` : ''}`
		)
		.setImage(
			'https://cdn.discordapp.com/attachments/920771763976167455/935659463434698783/179ad8548cf42d494bfb473171a1124b.jpg'
		);

	return {
		content: `Your minion is now attempting to kill ${quantity}x Naxxus, the trip will take ${formatDuration(duration)}.`,
		embeds: [embed.data]
	};
}
