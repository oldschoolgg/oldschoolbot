import { userMention } from 'discord.js';
import { Time, roll } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { Emoji } from '../../../lib/constants';
import { MaterialBank } from '../../../lib/invention/MaterialBank';
import { inventionBoosts, transactMaterialsFromUser } from '../../../lib/invention/inventions';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { DisassembleTaskOptions } from '../../../lib/types/minions';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../../../lib/util/clientSettings';
import getOSItem from '../../../lib/util/getOSItem';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export async function disassemblyTask(data: DisassembleTaskOptions) {
	const { userID, qty } = data;
	const user = await mUserFetch(userID);
	const item = getOSItem(data.i);

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

	const { items_disassembled_cost } = await mahojiClientSettingsFetch({
		items_disassembled_cost: true
	});
	await mahojiClientSettingsUpdate({
		items_disassembled_cost: new Bank(items_disassembled_cost as ItemBank).add(cost).bank
	});

	const xpStr = await user.addXP({
		skillName: SkillsEnum.Invention,
		amount: data.xp,
		duration: data.duration,
		multiplier: false,
		masterCapeBoost: true
	});

	let str = `${userMention(data.userID)}, ${
		user.minionName
	} finished disassembling ${cost}. You received these materials: ${materialLoot}.
${xpStr}`;

	const loot = new Bank();
	const minutes = Math.floor(data.duration / Time.Minute);
	const cogsworthChancePerHour = 100;
	const chancePerMinute = cogsworthChancePerHour * 60;
	const prizeLoot = new Bank();
	for (let i = 0; i < minutes; i++) {
		if (roll(chancePerMinute)) {
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

	handleTripFinish(user, data.channelID, str, undefined, data, null);
}

export const disassemblingTask: MinionTask = {
	type: 'Disassembling',
	async run(data: DisassembleTaskOptions) {
		disassemblyTask(data);
	}
};
