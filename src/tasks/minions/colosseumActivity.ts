import { randArrItem } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { ColosseumWaveBank, colosseumWaves } from '../../lib/colosseum';

import { incrementMinigameScore } from '../../lib/settings/minigames';
import type { ColoTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import resolveItems from '../../lib/util/resolveItems';
import { userStatsUpdate } from '../../mahoji/mahojiSettings';

const sunfireItems = resolveItems(['Sunfire fanatic helm', 'Sunfire fanatic cuirass', 'Sunfire fanatic chausses']);

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
		for (const [key, value] of Object.entries(stats.colo_kc_bank as ItemBank))
			newKCs.add(Number.parseInt(key), value);
		await userStatsUpdate(user.id, { colo_kc_bank: newKCs._bank });
		const newKCsStr = `${newKCs
			.entries()
			.map(([kc, amount]) => `Wave ${kc}: ${amount} KC`)
			.join(', ')}`;

		const newWaveKcStr = !diedAt || diedAt > 1 ? `New wave KCs: ${newKCsStr}.` : 'No new KCs.';
		if (diedAt) {
			const wave = colosseumWaves.find(i => i.waveNumber === diedAt)!;
			return handleTripFinish(
				user,
				channelID,
				`${user}, you died on wave ${diedAt} to ${randArrItem([
					...(wave?.reinforcements ?? []),
					...wave.enemies
				])}, and received no loot. ${newWaveKcStr}`,
				undefined,
				data,
				null
			);
		}

		await incrementMinigameScore(user.id, 'colosseum');

		const loot = new Bank().add(possibleLoot);

		const missingItems = sunfireItems.filter(id => !user.cl.has(id));
		const itemsTheyHave = sunfireItems.filter(id => user.cl.has(id));
		if (missingItems.length > 0) {
			for (const item of sunfireItems) {
				if (loot.has(item) && itemsTheyHave.includes(item)) {
					loot.remove(item);
					loot.add(randArrItem(missingItems));
				}
			}
		}

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, you completed the Colosseum! You received: ${loot}. ${newWaveKcStr}`;

		if (!stats.colo_max_glory || maxGlory > stats.colo_max_glory) {
			await userStatsUpdate(user.id, { colo_max_glory: maxGlory });
			str += ` Your new max glory is ${maxGlory}!`;
		}

		const image = await makeBankImage({ bank: itemsAdded, title: 'Colosseum Loot', user, previousCL });

		return handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
