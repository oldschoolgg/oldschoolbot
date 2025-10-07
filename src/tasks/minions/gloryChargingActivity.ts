import { roll } from '@oldschoolgg/rng';
import { Events } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { gloriesInventorySize } from '@/mahoji/lib/abstracted_commands/chargeGloriesCommand.js';

export const gloryChargingTask: MinionTask = {
	type: 'GloryCharging',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { quantity, channelID } = data;

		let deaths = 0;
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			if (roll(99)) {
				deaths++;
			} else {
				for (let i = 0; i < gloriesInventorySize; i++) {
					if (roll(25_000)) {
						loot.add('Amulet of eternal glory');
					} else {
						loot.add('Amulet of glory(6)');
					}
				}
			}
		}

		const amnt = loot.amount('Amulet of glory(6)');

		let str =
			loot.length === 0
				? `${user}, ${user.minionName} finished their glory charging trip, but died and lost all glories.`
				: `${user}, ${user.minionName} finished charging ${amnt} Amulets of glory.`;

		if (loot.length !== 0 && deaths > 0) {
			str += ` They died ${deaths}x times, causing the loss of ${gloriesInventorySize * deaths} glories.`;
		}

		if (loot.has('Amulet of eternal glory')) {
			str += '\n**Your minion received an Amulet of eternal glory.**';
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${user.minionName}, just received **${loot.amount(
					'Amulet of eternal glory'
				)}x Amulet of eternal glory**!`
			);
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
