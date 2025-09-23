import { formatDuration } from '@oldschoolgg/toolkit/datetime';
import { stringMatches } from '@oldschoolgg/toolkit/string-util';
import { increaseNumByPercent, reduceNumByPercent, Time } from 'e';
import { Bank, SkillsEnum } from 'oldschooljs';

import { KourendKebosDiary, userhasDiaryTier } from '@/lib/diaries.js';
import { inventionBoosts, InventionID, inventionItemBoost } from '@/lib/invention/inventions.js';
import type { DarkAltarOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength';
import getOSItem from '@/lib/util/getOSItem';
import { hasSkillReqs } from '@/lib/util/smallUtils';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import { userHasGracefulEquipped } from '@/mahoji/mahojiSettings.js';

export const darkAltarRunes = {
	soul: {
		item: getOSItem('Soul rune'),
		baseTime: Time.Second * 2.2,
		xp: 19.6,
		level: 90,
		petChance: 782_999
	},
	blood: {
		item: getOSItem('Blood rune'),
		baseTime: Time.Second * 2.2,
		xp: 17.2,
		level: 77,
		petChance: 804_984
	}
} as const;

const gracefulPenalty = 20;
const agilityPenalty = 35;
const mediumDiaryBoost = 20;

export async function darkAltarCommand({
	user,
	channelID,
	name,
	extracts
}: {
	user: MUser;
	channelID: string;
	name: string;
	extracts?: boolean;
}) {
	const stats = user.skillsAsLevels;
	if (!['blood', 'soul'].includes(name.toLowerCase().split(' ')[0])) return 'Invalid rune.';
	const [hasReqs, neededReqs] = hasSkillReqs(user, {
		mining: 38,
		crafting: 38
	});
	if (!hasReqs) {
		return `You can't craft Blood runes at the Dark Altar, because you don't have these required stats: ${neededReqs}.`;
	}

	const rune = name.toLowerCase().includes('soul') ? 'soul' : 'blood';
	const runeData = darkAltarRunes[rune];

	if (stats.runecraft < runeData.level) {
		return `You need level ${runeData.level} Runecraft to craft ${runeData.item.name}'s.`;
	}

	let timePerRune = runeData.baseTime;

	const boosts = [];
	const [hasEliteDiary] = await userhasDiaryTier(user, KourendKebosDiary.elite);
	if (hasEliteDiary && rune === 'blood') {
		boosts.push('10% additional runes for Kourend/Kebos elite diary');
	}

	const [hasMediumDiary] = await userhasDiaryTier(user, KourendKebosDiary.medium);
	if (hasMediumDiary) {
		boosts.push(`${mediumDiaryBoost}% faster essence mining for Kourend/Kebos medium diary`);
		timePerRune = reduceNumByPercent(timePerRune, mediumDiaryBoost);
	}

	if (!userHasGracefulEquipped(user)) {
		boosts.push(`${gracefulPenalty}% slower for no Graceful`);
		timePerRune = increaseNumByPercent(timePerRune, gracefulPenalty);
	}

	if (user.skillLevel(SkillsEnum.Agility) < 73) {
		boosts.push(`${agilityPenalty}% slower for less than level 73 Agility`);
		timePerRune = increaseNumByPercent(timePerRune, agilityPenalty);
	}

	const maxTripLength = calcMaxTripLength(user, 'DarkAltar');

	// Calculate Abyssal amulet boost:
	if (user.hasEquippedOrInBank(['Abyssal amulet'])) {
		const abyssalAmuletBoost = inventionBoosts.abyssalAmulet.boosts.find(b =>
			b.runes.some(r => stringMatches(r, `${rune} rune (zeah)`))
		);
		if (abyssalAmuletBoost) {
			const res = await inventionItemBoost({
				user,
				inventionID: InventionID.AbyssalAmulet,
				duration: maxTripLength
			});
			if (res.success) {
				timePerRune = reduceNumByPercent(timePerRune, abyssalAmuletBoost.boost);
				boosts.push(`${abyssalAmuletBoost.boost}% boost for Abyssal amulet (Removed ${res.materialCost})`);
			}
		}
	}
	let quantity = Math.floor(maxTripLength / timePerRune);
	let duration = maxTripLength;
	const totalCost = new Bank();
	if (extracts) {
		const extractsOwned = user.bank.amount('Scarred extract');
		quantity = Math.min(quantity, extractsOwned);
		if (extractsOwned === 0 || quantity === 0) {
			return "You don't have enough Scarred extracts to craft these runes.";
		}
		duration = quantity * timePerRune;
		totalCost.add('Scarred extract', quantity);
		if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;
	}

	if (totalCost.length > 0) {
		await user.removeItemsFromBank(totalCost);
		updateBankSetting('runecraft_cost', totalCost);
	}

	await addSubTaskToActivityTask<DarkAltarOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'DarkAltar',
		hasElite: hasEliteDiary,
		rune,
		useExtracts: extracts
	});

	let response = `${user.minionName} is now going to Runecraft ${runeData.item.name}'s for ${formatDuration(
		duration
	)} at the Dark altar.`;

	if (extracts) {
		response += `\nYou will use ${quantity}x Scarred extract during this trip.`;
	}

	if (boosts.length > 0) {
		response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}
	return response;
}
