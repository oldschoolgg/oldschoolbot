import { Bank } from 'oldschooljs';

import { TuraelsTrialsMethod } from '../../../lib/bso/turaelsTrials';
import { SkillsEnum } from '../../../lib/skilling/types';
import { TuraelsTrialsOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { trackClientBankStats, userStatsBankUpdate } from '../../../mahoji/mahojiSettings';

export function calculateTuraelsTrialsResult({ quantity, method }: { quantity: number; method: TuraelsTrialsMethod }) {
	let slayerXP = 49_000 * quantity;
	const loot = new Bank();
	let meleeXP = 0;
	let rangedXP = 0;
	let magicXP = 0;

	if (method === 'melee') {
		meleeXP = 249_000 * quantity;
	} else if (method === 'range') {
		rangedXP = 249_000 * quantity;
	} else {
		magicXP = 249_000 * quantity;
	}

	return {
		slayerXP,
		loot,
		meleeXP,
		rangedXP,
		magicXP
	};
}

export const turaelsTrialsTask: MinionTask = {
	type: 'TuraelsTrials',
	async run(data: TuraelsTrialsOptions) {
		let { q: quantity, channelID, userID, duration, m: method } = data;
		const user = await mUserFetch(userID);

		const result = calculateTuraelsTrialsResult({ quantity, method });

		await user.addItemsToBank({ items: result.loot, collectionLog: true });
		await trackClientBankStats('turaels_trials_loot_bank', result.loot);
		await userStatsBankUpdate(user.id, 'turaels_trials_loot_bank', result.loot);

		const xpResults: string[] = [];
		xpResults.push(
			await user.addXP({
				skillName: SkillsEnum.Slayer,
				amount: result.slayerXP,
				duration,
				minimal: true
			})
		);

		if (result.magicXP !== 0) {
			xpResults.push(
				await user.addXP({
					skillName: SkillsEnum.Magic,
					amount: result.magicXP,
					duration,
					minimal: true
				})
			);
		}
		if (result.rangedXP !== 0) {
			xpResults.push(
				await user.addXP({
					skillName: SkillsEnum.Ranged,
					amount: result.rangedXP,
					duration,
					minimal: true
				})
			);
		}
		if (result.meleeXP !== 0) {
			xpResults.push(
				await user.addXP({
					skillName: SkillsEnum.Attack,
					amount: result.meleeXP / 3,
					duration,
					minimal: true
				})
			);
			xpResults.push(
				await user.addXP({
					skillName: SkillsEnum.Strength,
					amount: result.meleeXP / 3,
					duration,
					minimal: true
				})
			);
			xpResults.push(
				await user.addXP({
					skillName: SkillsEnum.Defence,
					amount: result.meleeXP / 3,
					duration,
					minimal: true
				})
			);
		}

		return handleTripFinish(
			user,
			channelID,
			`${user}, your minion finished slaying ${quantity}x superiors in Turaels Trials. ${xpResults.join(', ')}`,
			undefined,
			data,
			result.loot
		);
	}
};
