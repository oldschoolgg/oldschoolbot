import { randArrItem, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';

import { userHasFlappy } from '../../../lib/invention/inventions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClueTable } from '../../../lib/simulation/sharedTables';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import resolveItems from '../../../lib/util/resolveItems';

const inventorOutfit = resolveItems([
	"Inventors' helmet",
	"Inventors' torso",
	"Inventors' legs",
	"Inventors' gloves",
	"Inventors' boots",
	"Inventors' backpack"
]);
function tinkerLoot(user: MUser, quantity: number) {
	const loot = new Bank();
	let effectiveCL = user.cl.clone();
	for (let i = 0; i < quantity; i++) {
		const outfitPieceNotOwned = randArrItem(inventorOutfit.filter(p => !effectiveCL.has(p)));
		if (roll(6)) {
			loot.add(ClueTable.roll());
		}
		if (roll(150)) loot.add('Materials bag');
		if (outfitPieceNotOwned && roll(16)) {
			loot.add(outfitPieceNotOwned);
			effectiveCL.add(outfitPieceNotOwned);
			continue;
		}
	}
	return loot;
}

export const twTask: MinionTask = {
	type: 'TinkeringWorkshop',
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		await incrementMinigameScore(userID, 'tinkering_workshop', quantity);

		const user = await mUserFetch(userID);
		const loot = tinkerLoot(user, quantity);

		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) loot.multiply(2);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let xp = 0;
		for (let i = 0; i < quantity; i++) {
			xp += randInt(4000, 6000);
		}
		const xpStr = await user.addXP({ amount: xp, skillName: SkillsEnum.Invention, duration });

		let str = `${user}, ${user.minionName} finished tinkering with ${quantity}x projects, you received ${loot} and ${xpStr}.`;

		if (flappyRes.userMsg) str += `\n${flappyRes.userMsg}`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
