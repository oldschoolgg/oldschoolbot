import { formatOrdinal } from '@oldschoolgg/toolkit';
import { userMention } from 'discord.js';
import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { Events } from '../../../lib/constants';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { trackLoot } from '../../../lib/lootTrack';
import { MOKTANG_ID, MoktangLootTable } from '../../../lib/minions/data/killableMonsters/custom/bosses/Moktang';
import { MoktangTaskOptions } from '../../../lib/types/minions';
import { itemNameFromID } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export const moktangTask: MinionTask = {
	type: 'Moktang',
	async run(data: MoktangTaskOptions) {
		const { userID, qty } = data;
		const user = await mUserFetch(userID);

		await user.incrementKC(MOKTANG_ID, qty);

		let loot = new Bank();

		for (let i = 0; i < qty; i++) {
			loot.add(MoktangLootTable.roll());
		}
		if (isDoubleLootActive(data.duration)) {
			loot.multiply(2);
			data.cantBeDoubled = true;
		}

		const res = await user.addItemsToBank({ items: loot, collectionLog: true });
		await updateBankSetting('moktang_loot', loot);
		await trackLoot({
			duration: data.duration,
			totalLoot: loot,
			type: 'Monster',
			changeType: 'loot',
			id: 'moktang',
			kc: qty,
			users: [
				{
					id: user.id,
					loot,
					duration: data.duration
				}
			]
		});

		const xpStr = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: user.skillLevel(SkillsEnum.Mining) * 2000 * qty,
			duration: data.duration,
			multiplier: false,
			masterCapeBoost: true
		});

		const image = await makeBankImage({
			bank: res.itemsAdded,
			title: `Loot From ${qty} Moktang`,
			user,
			previousCL: res.previousCL
		});

		const newKC = await user.getKC(MOKTANG_ID);
		for (const item of resolveItems(['Igne gear frame', 'Mini moktang'])) {
			if (loot.has(item)) {
				globalClient.emit(
					Events.ServerNotification,
					`**${user.usernameOrMention}'s** minion just received their ${formatOrdinal(
						user.cl.amount(item)
					)} ${itemNameFromID(item)} on their ${formatOrdinal(randInt(newKC - qty, newKC))} kill!`
				);
			}
		}

		let str = `${userMention(data.userID)}, ${user.minionName} finished killing ${qty}x Moktang. Received ${loot}.

${xpStr}`;

		handleTripFinish(user, data.channelID, str, image.file.attachment, data, loot);
	}
};
