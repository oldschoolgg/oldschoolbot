import { MathRNG } from '@oldschoolgg/rng';
import { Emoji, Events } from '@oldschoolgg/toolkit';
import { EItem } from 'oldschooljs';

import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { FishingActivityTaskOptions } from '@/lib/types/minions.js';

export const fishingTask: MinionTask = {
	type: 'Fishing',
	async run(data: FishingActivityTaskOptions, { handleTripFinish, user }) {
		const { fishID, quantity, channelID } = data;
		const fish = Fishing.Fishes.find(fish => fish.id === fishID)!;

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: data.duration,
			quantity,
			flakesQuantity: data.flakesQuantity,
			gearBank: user.gearBank,
			rng: MathRNG
		});

		const resultOrError = await result.updateBank.transact(user);
		if (typeof resultOrError === 'string') {
			const err = new Error(`Fishing trip update bank failed: ${resultOrError}`);
			Logging.logError(err, {
				userID: user.id,
				fishID,
				quantity
			});
			return;
		}
		const { itemTransactionResult, rawResults } = resultOrError;

		let str = `${user}, ${user.minionName} finished fishing ${quantity} ${fish.name}. ${rawResults.join(', ')}`;

		if (result.boosts.length > 0) {
			str += `\n\n**Boosts:** ${result.boosts.join(', ')}`;
		}

		if (itemTransactionResult?.itemsAdded.has(EItem.HERON)) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Fishing} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Heron while fishing ${fish.name} at level ${user.skillsAsLevels.fishing} Fishing!`
			);
		}

		handleTripFinish(user, channelID, str, undefined, data, itemTransactionResult?.itemsAdded ?? null);
	}
};
