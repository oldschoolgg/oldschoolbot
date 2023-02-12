import { calcPercentOfNum, calcWhatPercent, clamp, randArrItem, randInt, roll, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';

import { MAX_LEVEL } from '../../../lib/constants';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { getAllUserTames, tameName, TameSpeciesID } from '../../../lib/tames';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import resolveItems from '../../../lib/util/resolveItems';

function calcXP(user: MUser, duration: number, skill: SkillsEnum) {
	return calcPercentOfNum(calcWhatPercent(user.skillLevel(skill), MAX_LEVEL), duration / 80);
}

const tameMessages = ["ate a member of the audience who wasn't watching", 'ate a spectator that was boo-ing you'];

const spectatorClothes = resolveItems([
	'A stylish hat (male, yellow)',
	'Shirt (male, yellow)',
	'Leggings (yellow)',
	'A stylish hat (male, maroon)',
	'Shirt (male, maroon)',
	'Leggings (maroon)',
	'A stylish hat (male, green)',
	'Shirt (male, green)',
	'Leggings (green)',
	'A stylish hat (female, yellow)',
	'Shirt (female, yellow)',
	'Skirt (yellow)',
	'A stylish hat (female, maroon)',
	'Shirt (female, maroon)',
	'Skirt (maroon)',
	'A stylish hat (female, green)',
	'Shirt (female, green)',
	'Skirt (green)',
	'Shoes (male, shoes)',
	'Shoes (male, boots)',
	'Shoes (female, straps)',
	'Shoes (female, flats)'
]);

export const bonanzaTask: MinionTask = {
	type: 'BalthazarsBigBonanza',
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		const [user, tames, incrementResult] = await Promise.all([
			mUserFetch(userID),
			getAllUserTames(userID),
			incrementMinigameScore(userID, 'balthazars_big_bonanza', quantity)
		]);
		const xpStrs = await Promise.all([
			user.addXP({
				amount: calcXP(user, duration, SkillsEnum.Agility),
				skillName: SkillsEnum.Agility,
				duration,
				source: 'BalthazarsBigBonanza',
				minimal: true
			}),
			user.addXP({
				amount: calcXP(user, duration, SkillsEnum.Ranged),
				skillName: SkillsEnum.Ranged,
				duration,
				source: 'BalthazarsBigBonanza',
				minimal: true
			}),
			user.addXP({
				amount: calcXP(user, duration, SkillsEnum.Thieving),
				skillName: SkillsEnum.Thieving,
				duration,
				source: 'BalthazarsBigBonanza',
				minimal: true
			})
		]);
		const loot = new Bank();

		const averageLevel =
			user.skillLevel(SkillsEnum.Agility) +
			user.skillLevel(SkillsEnum.Ranged) +
			user.skillLevel(SkillsEnum.Thieving) / 3;

		const tickets = randInt(clamp(averageLevel / 2, 1, 120), averageLevel);
		loot.add('Circus ticket', tickets);

		let str = `${user}, ${
			user.minionName
		} finished participating in Balthazar's Big Bonanza, you received ${loot} and ${xpStrs.join(
			', '
		)}. You have participated ${incrementResult.newScore} times, come back in a week!`;

		const freeIgneTames = tames.filter(i => i.tame_activity.length === 0 && i.species_id === TameSpeciesID.Igne);
		const freeIgneTame = randArrItem(freeIgneTames);
		const allUserItems = user.allItemsOwned();
		const unownedSpectatorClothes = shuffleArr(spectatorClothes)
			.filter(i => !allUserItems.has(i))
			.slice(0, 3);
		if (freeIgneTame && unownedSpectatorClothes.length > 0) {
			for (const item of unownedSpectatorClothes) loot.add(item);
			str += `\n${tameName(freeIgneTame)} ${randArrItem(tameMessages)}, and gave you their clothes!`;
		}
		if (!allUserItems.has("Giant's hand") && roll(5)) {
			loot.add("Giant's hand");
			str += "\nYou found a Giant's hand!";
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
