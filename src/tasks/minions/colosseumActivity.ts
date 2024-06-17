import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { ColosseumWaveBank } from '../../lib/colosseum';
import { trackLoot } from '../../lib/lootTrack';
import { ColoTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { userStatsBankUpdate, userStatsUpdate } from '../../mahoji/mahojiSettings';

export const colosseumTask: MinionTask = {
	type: 'Colosseum',
	async run(data: ColoTaskOptions) {
		const { channelID, userID, loot: possibleLoot, diedAt, maxGlory } = data;
		const user = await mUserFetch(userID);

		const newKCs = new ColosseumWaveBank();
		for (let i = 0; i < (diedAt ? diedAt - 1 : 12); i++) {
			newKCs.add(i + 1);
		}
		const stats = await user.fetchStats({ colo_kc_bank: true, colo_max_glory: true });
		for (const [key, value] of Object.entries(stats.colo_kc_bank as ItemBank)) newKCs.add(parseInt(key), value);
		await userStatsUpdate(user.id, { colo_kc_bank: newKCs._bank });
		const newKCsStr = `${newKCs
			.entries()
			.map(([kc, amount]) => `Wave ${kc}: ${amount} KC`)
			.join(', ')}`;

		const newWaveKcStr = !diedAt || diedAt > 1 ? `New wave KCs: ${newKCsStr}.` : 'No new KCs.';
		if (diedAt) {
			return handleTripFinish(
				user,
				channelID,
				`${user}, you died on wave ${diedAt}, and received no loot. ${newWaveKcStr}`,
				undefined,
				data,
				null
			);
		}

		const loot = new Bank().add(possibleLoot);
		await user.addItemsToBank({ items: loot, collectionLog: true });

		await updateBankSetting('colo_loot', loot);
		await userStatsBankUpdate(user.id, 'colo_loot', loot);
		await trackLoot({
			totalLoot: loot,
			id: 'colo',
			type: 'Minigame',
			changeType: 'loot',
			duration: data.duration,
			kc: 1,
			users: [
				{
					id: user.id,
					loot,
					duration: data.duration
				}
			]
		});

		let str = `${user}, you completed the Colosseum! You received: ${loot}. ${newWaveKcStr}`;

		if (!stats.colo_max_glory || maxGlory > stats.colo_max_glory) {
			await userStatsUpdate(user.id, { colo_max_glory: maxGlory });
			str += ` Your new max glory is ${maxGlory}!`;
		}

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
