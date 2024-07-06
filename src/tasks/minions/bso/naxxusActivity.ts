import { rollNaxxusLoot } from '../../../lib/bso/naxxus/rollNaxxusLoot';
import { trackLoot } from '../../../lib/lootTrack';
import { Naxxus } from '../../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

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

		announceLoot({
			user,
			monsterID: Naxxus.id,
			loot,
			notifyDrops: Naxxus.notifyDrops
		});

		updateBankSetting('naxxus_loot', loot);
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
