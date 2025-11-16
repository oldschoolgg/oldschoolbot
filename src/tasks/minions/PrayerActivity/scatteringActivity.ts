import { Bank } from 'oldschooljs';

import Prayer from '@/lib/skilling/skills/prayer.js';
import type { ScatteringActivityTaskOptions } from '@/lib/types/minions.js';

export const scatteringTask: MinionTask = {
	type: 'Scattering',
	async run(data: ScatteringActivityTaskOptions, { user, handleTripFinish }) {
		const { ashID, quantity, channelId, duration } = data;

		const ash = Prayer.Ashes.find(ash => ash.inputId === ashID)!;
		const xpReceived = quantity * ash.xp;

		const xpRes = await user.addXP({
			skillName: 'prayer',
			amount: xpReceived,
			source: 'ScatteringAshes',
			duration
		});

		const str = `${user}, ${user.minionName} finished scattering ${quantity}x ${ash.name}. ${xpRes}`;

		await user.statsBankUpdate('scattered_ashes_bank', new Bank().add(ash.inputId, quantity));

		handleTripFinish({ user, channelId, message: str, data });
	}
};
