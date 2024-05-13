import { calcPercentOfNum, calcWhatPercent, clamp, randArrItem, randInt, roll, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';

import { MAX_LEVEL } from '../../../lib/constants';
import { spectatorClothes } from '../../../lib/data/CollectionsExport';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { getAllUserTames, TameSpeciesID } from '../../../lib/tames';
import { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { tameName } from '../../../lib/util/tameUtil';

function calcXP(user: MUser, duration: number, skill: SkillsEnum) {
	return calcPercentOfNum(calcWhatPercent(user.skillLevel(skill), MAX_LEVEL), duration / 80);
}

const tameMessages = ["ate a member of the audience who wasn't watching", 'ate a spectator that was boo-ing you'];

export const bonanzaTask: MinionTask = {
	type: 'BalthazarsBigBonanza',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
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

		const freeIgneTames = tames.filter(i => i.tame_activity.length === 0 && i.species_id === TameSpeciesID.Igne);
		const freeIgneTame = randArrItem(freeIgneTames);
		const allUserItems = user.allItemsOwned;
		const unownedSpectatorClothes = shuffleArr(spectatorClothes)
			.filter(i => !allUserItems.has(i))
			.slice(0, 3);

		const messages: string[] = [];
		if (freeIgneTame && unownedSpectatorClothes.length > 0) {
			for (const item of unownedSpectatorClothes) loot.add(item);
			messages.push(`${tameName(freeIgneTame)} ${randArrItem(tameMessages)}, and gave you their clothes!`);
		}
		if (!allUserItems.has("Giant's hand") && roll(5)) {
			loot.add("Giant's hand");
			messages.push("You found a Giant's hand!");
		}

		let str = `${user}, ${
			user.minionName
		} finished participating in Balthazar's Big Bonanza, you received ${loot} and ${xpStrs.join(
			', '
		)}. You have participated ${incrementResult.newScore} times, come back in a week!`;

		if (messages.length > 0) {
			str += `\n\n**Messages:** ${messages.join(', ')}`;
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });
		await user.update({ last_bonanza_date: new Date() });

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
