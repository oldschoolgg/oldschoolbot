import type { DisassembleTaskOptions } from '@/lib/bso/bsoTypes.js';
import { inventionBoosts, transactMaterialsFromUser } from '@/lib/bso/skills/invention/inventions.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { Emoji, Time } from '@oldschoolgg/toolkit';
import { userMention } from '@oldschoolgg/discord';
import { Bank, type ItemBank, Items } from 'oldschooljs';

export const disassemblingTask: MinionTask = {
	type: 'Disassembling',
	async run(data: DisassembleTaskOptions, { user, handleTripFinish, rng }) {
		const { qty } = data;
		const item = Items.getOrThrow(data.i);

		const messages: string[] = [];
		const cost = new Bank().add(item.id, qty);
		const materialLoot = new MaterialBank(data.mats);
		if (user.hasEquippedOrInBank('Invention master cape')) {
			materialLoot.mutIncreaseAllValuesByPercent(inventionBoosts.inventionMasterCape.extraMaterialsPercent);
			messages.push(`${inventionBoosts.inventionMasterCape.extraMaterialsPercent}% bonus materials for mastery`);
		}

		await transactMaterialsFromUser({
			user,
			add: materialLoot,
			addToDisassembledItemsBank: cost
		});

		const { items_disassembled_cost } = await ClientSettings.fetch({
			items_disassembled_cost: true
		});
		await ClientSettings.update({
			items_disassembled_cost: new Bank(items_disassembled_cost as ItemBank).add(cost).toJSON()
		});

		const xpStr = await user.addXP({
			skillName: 'invention',
			amount: data.xp,
			duration: data.duration,
			multiplier: false,
			masterCapeBoost: true
		});

		let str = `${userMention(data.userID)}, ${user.minionName
			} finished disassembling ${cost}. You received these materials: ${materialLoot}.
${xpStr}`;

		const loot = new Bank();
		const minutes = Math.floor(data.duration / Time.Minute);
		const cogsworthChancePerHour = 100;
		const chancePerMinute = cogsworthChancePerHour * 60;
		const prizeLoot = new Bank();
		for (let i = 0; i < minutes; i++) {
			if (rng.roll(chancePerMinute)) {
				loot.add('Cogsworth');
			}
		}
		if (loot.has('Cogsworth')) {
			messages.push(
				'**While disassembling some items, your minion suddenly was inspired to create a mechanical pet out of some scraps!**'
			);
		}

		if (prizeLoot.length > 0) {
			loot.add(prizeLoot);
			messages.push(`${Emoji.Gift} You received ${prizeLoot} as a bonus!`);
		}
		if (loot.length > 0) {
			await user.addItemsToBank({ items: loot, collectionLog: true });
		}
		if (messages.length > 0) {
			str += `\n**Messages:** ${messages.join(', ')}`;
		}

		handleTripFinish({ user, channelId: data.channelId, message: str, data });
	}
};
