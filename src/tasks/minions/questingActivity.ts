import { randInt } from 'e';
import { Bank } from 'oldschooljs';

import { globalDroprates } from '../../lib/data/globalDroprates';
import { MAX_QP } from '../../lib/minions/data/quests';
import type { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const questingTask: MinionTask = {
	type: 'Questing',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID } = data;
		const user = await mUserFetch(userID);
		const currentQP = user.QP;

		// This assumes you do quests in order of scaling difficulty, ~115 hours for max qp
		let qpReceived = randInt(1, 30);

		const newQP = currentQP + qpReceived;

		// The minion could be at (MAX_GLOBAL_QP - 1) QP, but gain 4 QP here, so we'll trim that down from 4 to 1.
		if (newQP > MAX_QP) {
			qpReceived -= newQP - MAX_QP;
		}

		let str = `${user}, ${
			user.minionName
		} finished questing, you received ${qpReceived.toLocaleString()} QP. Your current QP is ${
			currentQP + qpReceived
		}.`;

		const hasMaxQP = newQP >= MAX_QP;
		if (hasMaxQP) {
			str += `\n\nYou have achieved the maximum amount of ${MAX_QP} Quest Points!`;
		}

		await user.update({
			QP: {
				increment: qpReceived
			}
		});

		if (roll(globalDroprates.zippyQuesting.baseRate)) {
			str +=
				'\n<:zippy:749240799090180196> While you walk through the forest north of falador, a small ferret jumps onto your back and joins you on your adventures!';
			await user.addItemsToBank({ items: new Bank().add('Zippy'), collectionLog: true });
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
