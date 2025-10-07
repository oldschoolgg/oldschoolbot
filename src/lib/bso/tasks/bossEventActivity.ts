import { bossEvents } from '@/lib/bso/bossEvents.js';
import type { NewBossOptions } from '@/lib/bso/bsoTypes.js';
import type { BossUser } from '@/lib/bso/structures/Boss.js';

import { Bank } from 'oldschooljs';

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
