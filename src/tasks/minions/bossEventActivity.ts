import { Bank } from 'oldschooljs';

import { bossEvents } from '../../lib/bossEvents';
import type { BossUser } from '../../lib/structures/Boss';
import type { NewBossOptions } from '../../lib/types/minions';

export const bossEventTask: MinionTask = {
	type: 'BossEvent',
	async run(data: NewBossOptions) {
		const bossUsers: BossUser[] = await Promise.all(
			data.bossUsers.map(async u => ({
				...u,
				itemsToRemove: new Bank(u.itemsToRemove),
				user: await mUserFetch(u.user)
			}))
		);
		const bossEvent = bossEvents.find(b => b.id === data.bossID)!;
		bossEvent.handleFinish(data, bossUsers);
	}
};
