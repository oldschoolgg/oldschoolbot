import { Time, increaseNumByPercent, reduceNumByPercent } from 'e';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { userHasGracefulEquipped } from '../../../mahoji/mahojiSettings';
import { KourendKebosDiary, userhasDiaryTier } from '../../diaries';
import type { DarkAltarOptions } from '../../types/minions';
import { formatDuration, hasSkillReqs } from '../../util';
import addSubTaskToActivityTask from '../../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../util/calcMaxTripLength';
import getOSItem from '../../util/getOSItem';

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

export async function darkAltarCommand({ user, channelID, name }: { user: MUser; channelID: string; name: string }) {
	const stats = user.skillsAsLevels;
	if (!['blood', 'soul'].includes(name.split(' ')[0])) return 'Invalid rune.';
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
	const quantity = Math.floor(maxTripLength / timePerRune);

	await addSubTaskToActivityTask<DarkAltarOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration: maxTripLength,
		type: 'DarkAltar',
		hasElite: hasEliteDiary,
		rune
	});

	let response = `${user.minionName} is now going to Runecraft ${runeData.item.name}'s for ${formatDuration(
		maxTripLength
	)} at the Dark altar.`;

	if (boosts.length > 0) {
		response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}
	return response;
}
