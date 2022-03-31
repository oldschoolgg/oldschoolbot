import { increaseNumByPercent, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { KourendKebosDiary, userhasDiaryTier } from '../../diaries';
import { DarkAltarOptions } from '../../types/minions';
import { formatDuration } from '../../util';
import addSubTaskToActivityTask from '../../util/addSubTaskToActivityTask';
import getOSItem from '../../util/getOSItem';
import { Favours, gotFavour } from '../data/kourendFavour';

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
	name
}: {
	user: KlasaUser;
	channelID: bigint;
	name: string;
}) {
	if (!['blood', 'soul'].includes(name)) return 'Invalid rune.';
	const [hasSkillReqs, neededReqs] = user.hasSkillReqs({
		mining: 38,
		crafting: 38
	});
	if (!hasSkillReqs) {
		return `You can't craft Blood runes at the Dark Altar, because you don't have these required stats: ${neededReqs}.`;
	}
	const [hasFavour, requiredPoints] = gotFavour(user, Favours.Arceuus, 100);
	if (!hasFavour) {
		return `Crafting Blood/Soul runes at the Dark Altar requires ${requiredPoints}% Arceuus Favour.`;
	}
	const rune = name.toLowerCase().includes('soul') ? 'soul' : 'blood';
	const runeData = darkAltarRunes[rune];

	if (user.skillLevel(SkillsEnum.Runecraft) < runeData.level) {
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

	if (!user.hasGracefulEquipped()) {
		boosts.push(`${gracefulPenalty}% slower for no Graceful`);
		timePerRune = increaseNumByPercent(timePerRune, gracefulPenalty);
	}

	if (user.skillLevel(SkillsEnum.Agility) < 73) {
		boosts.push(`${agilityPenalty}% slower for less than level 73 Agility`);
		timePerRune = increaseNumByPercent(timePerRune, agilityPenalty);
	}

	const maxTripLength = user.maxTripLength('DarkAltar');
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
