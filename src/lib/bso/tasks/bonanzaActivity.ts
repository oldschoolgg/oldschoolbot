import { spectatorClothes } from '@/lib/bso/collection-log/main.js';
import { getAllUserTames, TameSpeciesID } from '@/lib/bso/tames/tames.js';
import { tameName } from '@/lib/bso/tames/tameUtil.js';

import { calcPercentOfNum, calcWhatPercent } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { clamp } from 'remeda';

import { MAX_LEVEL } from '@/lib/constants.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

function calcXP(user: MUser, duration: number, skill: SkillNameType) {
	return calcPercentOfNum(calcWhatPercent(user.skillLevel(skill), MAX_LEVEL), duration / 80);
}

const tameMessages = ["ate a member of the audience who wasn't watching", 'ate a spectator that was boo-ing you'];

export const bonanzaTask: MinionTask = {
	type: 'BalthazarsBigBonanza',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish, rng }) {
		const { channelID, quantity, duration } = data;
		const tames = await getAllUserTames(user.id);
		const incrementResult = await user.incrementMinigameScore('balthazars_big_bonanza', quantity);
		const xpStrs = await Promise.all([
			user.addXP({
				amount: calcXP(user, duration, 'agility'),
				skillName: 'agility',
				duration,
				source: 'BalthazarsBigBonanza',
				minimal: true
			}),
			user.addXP({
				amount: calcXP(user, duration, 'ranged'),
				skillName: 'ranged',
				duration,
				source: 'BalthazarsBigBonanza',
				minimal: true
			}),
			user.addXP({
				amount: calcXP(user, duration, 'thieving'),
				skillName: 'thieving',
				duration,
				source: 'BalthazarsBigBonanza',
				minimal: true
			})
		]);
		const loot = new Bank();

		const averageLevel = user.skillLevel('agility') + user.skillLevel('ranged') + user.skillLevel('thieving') / 3;

		const tickets = rng.randInt(clamp(averageLevel / 2, { min: 1, max: 120 }), averageLevel);
		loot.add('Circus ticket', tickets);

		const freeIgneTames = tames.filter(i => i.tame_activity.length === 0 && i.species_id === TameSpeciesID.Igne);
		const freeIgneTame = rng.pick(freeIgneTames);
		const allUserItems = user.allItemsOwned;
		const unownedSpectatorClothes = rng
			.shuffle(spectatorClothes)
			.filter(i => !allUserItems.has(i))
			.slice(0, 3);

		const messages: string[] = [];
		if (freeIgneTame && unownedSpectatorClothes.length > 0) {
			for (const item of unownedSpectatorClothes) loot.add(item);
			messages.push(`${tameName(freeIgneTame)} ${rng.pick(tameMessages)}, and gave you their clothes!`);
		}
		if (!allUserItems.has("Giant's hand") && rng.roll(5)) {
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
