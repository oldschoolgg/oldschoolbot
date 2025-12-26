import { Naxxus, rollNaxxusLoot } from '@/lib/bso/monsters/bosses/Naxxus.js';

import { trackLoot } from '@/lib/lootTrack.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

export const naxxusTask: MinionTask = {
	type: 'Naxxus',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { channelId, quantity, duration } = data;

		const loot = rollNaxxusLoot(quantity, user.cl);

		const xpStr = await user.addMonsterXP({
			monsterID: Naxxus.id,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null
		});

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		const { newKC } = await user.incrementKC(Naxxus.id, quantity);

		announceLoot({
			user,
			monsterID: Naxxus.id,
			loot,
			notifyDrops: Naxxus.notifyDrops
		});

		await ClientSettings.updateBankSetting('naxxus_loot', loot);
		await trackLoot({
			duration,
			totalLoot: loot,
			type: 'Monster',
			changeType: 'loot',
			id: Naxxus.name,
			kc: quantity,
			users: [
				{
					id: user.id,
					loot,
					duration
				}
			]
		});

		const message = new MessageBuilder()
			.setContent(
				`${user}, ${user.minionName} finished killing ${quantity} ${Naxxus.name}. Your Naxxus KC is now ${newKC}.\n\n${xpStr}`
			)
			.addBankImage({
				bank: itemsAdded,
				title: `Loot From ${quantity} ${Naxxus.name}:`,
				user,
				previousCL
			});

		return handleTripFinish({
			user,
			channelId,
			message,
			data,
			loot: itemsAdded
		});
	}
};
