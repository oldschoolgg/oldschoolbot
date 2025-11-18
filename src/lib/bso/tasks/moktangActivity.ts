import type { MoktangTaskOptions } from '@/lib/bso/bsoTypes.js';
import { isDoubleLootActive } from '@/lib/bso/doubleLoot.js';
import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { MoktangLootTable } from '@/lib/bso/monsters/bosses/Moktang.js';
import {
	FletchingTipsTable,
	HighTierStoneSpiritTable,
	lowRuneHighAdamantTable,
	runeWeaponTable,
	StoneSpiritTable
} from '@/lib/bso/tables/sharedTables.js';

import { userMention } from '@oldschoolgg/discord';
import { randInt } from '@oldschoolgg/rng';
import { calcPerHour, Events, formatOrdinal } from '@oldschoolgg/toolkit';
import { Bank, Items, increaseBankQuantitesByPercent, resolveItems } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import Smithing from '@/lib/skilling/skills/smithing/index.js';

export const moktangTask: MinionTask = {
	type: 'Moktang',
	async run(data: MoktangTaskOptions, { user, handleTripFinish }) {
		const { qty } = data;

		await user.incrementKC(EBSOMonster.MOKTANG, qty);

		const loot = new Bank();

		for (let i = 0; i < qty; i++) {
			loot.add(MoktangLootTable.roll());
		}

		const bonusPercent = Math.floor(user.skillLevel('mining') / 6);

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
		await ClientSettings.updateBankSetting('moktang_loot', loot);
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
			skillName: 'mining',
			amount: user.skillLevel('mining') * 2000 * qty,
			duration: data.duration,
			multiplier: false,
			masterCapeBoost: true
		});

		const newKC = await user.getKC(EBSOMonster.MOKTANG);
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

		const message = new MessageBuilder()
			.setContent(`${userMention(data.userID)}, ${
				user.minionName
			} finished killing ${qty}x Moktang (${calcPerHour(data.qty, data.duration).toFixed(1)}/hr). ${bonusPercent}% bonus loot because of your Mining level.

${xpStr}`)
			.addBankImage({
				bank: res.itemsAdded,
				title: `Loot From ${qty} Moktang`,
				user,
				previousCL: res.previousCL
			});

		return handleTripFinish({ user, channelId: data.channelId, message, data, loot });
	}
};
