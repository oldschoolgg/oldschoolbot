import { calcPerHour, formatOrdinal, randInt } from '@oldschoolgg/toolkit';
import { Events } from '@oldschoolgg/toolkit/constants';
import { userMention } from 'discord.js';
import { Bank, Items, increaseBankQuantitesByPercent, resolveItems, SkillsEnum } from 'oldschooljs';

import { isDoubleLootActive } from '@/lib/bso/doubleLoot.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { MOKTANG_ID, MoktangLootTable } from '@/lib/minions/data/killableMonsters/custom/bosses/Moktang.js';
import {
	FletchingTipsTable,
	HighTierStoneSpiritTable,
	lowRuneHighAdamantTable,
	runeWeaponTable,
	StoneSpiritTable
} from '@/lib/simulation/sharedTables.js';
import Smithing from '@/lib/skilling/skills/smithing/index.js';
import type { MoktangTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';

export const moktangTask: MinionTask = {
	type: 'Moktang',
	async run(data: MoktangTaskOptions) {
		const { userID, qty } = data;
		const user = await mUserFetch(userID);

		await user.incrementKC(MOKTANG_ID, qty);

		const loot = new Bank();

		for (let i = 0; i < qty; i++) {
			loot.add(MoktangLootTable.roll());
		}

		const bonusPercent = Math.floor(user.skillLevel(SkillsEnum.Mining) / 6);

		increaseBankQuantitesByPercent(loot, bonusPercent, [
			...StoneSpiritTable.allItems,
			...HighTierStoneSpiritTable.allItems,
			...Smithing.Bars.map(i => i.id),
			...runeWeaponTable.allItems,
			...FletchingTipsTable.allItems,
			...lowRuneHighAdamantTable.allItems
		]);

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
					)} ${Items.itemNameFromId(item)} on their ${formatOrdinal(randInt(newKC - qty, newKC))} kill!`
				);
			}
		}

		const str = `${userMention(data.userID)}, ${
			user.minionName
		} finished killing ${qty}x Moktang (${calcPerHour(data.qty, data.duration).toFixed(1)}/hr). ${bonusPercent}% bonus loot because of your Mining level.

${xpStr}`;

		handleTripFinish(user, data.channelID, str, image.file.attachment, data, loot);
	}
};
