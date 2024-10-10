import { Time, percentChance, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { chompyHats } from '../../../lib/constants';
import { WesternProv, userhasDiaryTier } from '../../../lib/diaries';
import { getMinigameScore } from '../../../lib/settings/minigames';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import getOSItem from '../../../lib/util/getOSItem';

const diaryBoosts = [
	[WesternProv.elite, 100],
	[WesternProv.medium, 50],
	[WesternProv.easy, 25]
] as const;

const baseChompyPerHour = 100;

const avas = [
	[getOSItem("Ava's accumulator"), 72],
	[getOSItem("Ava's assembler"), 80]
] as const;

export async function chompyHuntClaimCommand(user: MUser) {
	const chompyScore = await getMinigameScore(user.id, 'big_chompy_bird_hunting');
	const userBank = user.bank;
	const { cl } = user;

	const missingHats = chompyHats.filter(c => (!userBank.has(c[0].id) || !cl.has(c[0].id)) && chompyScore >= c[1]);

	if (missingHats.length === 0) return 'There is nothing to claim.';
	const missingHatsBank = new Bank();
	for (const mh of missingHats) missingHatsBank.add(mh[0].id, 1);

	await user.addItemsToBank({ items: missingHatsBank, collectionLog: true });
	return `Added the following hats to your bank: ${missingHatsBank}`;
}

export async function chompyHuntCommand(user: MUser, channelID: string) {
	if (user.QP < 10) {
		return 'You need at least 10 QP to hunt Chompy birds.';
	}

	const rangeGear = user.gear.range;
	if (!rangeGear.hasEquipped('Ogre bow')) {
		return 'You need an Ogre bow equipped in your range outfit, and Ogre arrows to hunt Chompy birds!';
	}

	const tripLength = calcMaxTripLength(user, 'BigChompyBirdHunting');

	const boosts = [];
	let quantity = Math.floor((baseChompyPerHour / Time.Hour) * tripLength);
	for (const [diary, boost] of diaryBoosts) {
		const [hasDiary] = await userhasDiaryTier(user, diary);
		if (hasDiary) {
			let bonus = 0;
			for (let i = 0; i < quantity; i++) {
				if (percentChance(boost)) {
					bonus++;
				}
			}
			quantity += bonus;
			boosts.push(`${boost}% for ${diary.name} ${WesternProv.name}`);

			break;
		}
	}

	let arrowsNeeded = quantity;
	for (const [ava, percent] of avas) {
		if (rangeGear.hasEquipped(ava.name)) {
			arrowsNeeded = Math.floor(reduceNumByPercent(arrowsNeeded, percent));
			boosts.push(`${percent}% less arrows for ${ava.name}`);
			break;
		}
	}

	const cost = new Bank().add('Ogre arrow', arrowsNeeded);
	if (!user.owns(cost)) {
		return `You don't have enough Ogre arrow's to kill ${quantity}x Chompy birds, you need ${arrowsNeeded}.`;
	}

	await transactItems({ userID: user.id, itemsToRemove: cost });

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: tripLength,
		type: 'BigChompyBirdHunting',
		quantity,
		minigameID: 'big_chompy_bird_hunting'
	});

	let str = `${user.minionName} is now hunting Big Chompy's! The trip will take ${formatDuration(
		tripLength
	)}. Removed ${cost} from your bank.`;

	if (boosts.length > 0) {
		str += `\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return str;
}
