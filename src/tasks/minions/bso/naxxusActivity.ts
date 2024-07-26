import { rollNaxxusLoot } from '../../../lib/bso/naxxus/rollNaxxusLoot';

import { Naxxus } from '../../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { addMonsterXP } from '../../../lib/minions/functions';

import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export const naxxusTask: MinionTask = {
	type: 'Naxxus',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, userID, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const loot = rollNaxxusLoot(quantity, user.cl);

		const xpStr = await addMonsterXP(user, {
			monsterID: Naxxus.id,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null
		});

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		const { newKC } = await user.incrementKC(Naxxus.id, quantity);

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity} ${Naxxus.name}:`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished killing ${quantity} ${Naxxus.name}. Your Naxxus KC is now ${newKC}.\n\n${xpStr}`,
			image.file.attachment,
			data,
			itemsAdded
		);
	}
};
