import { spoiler, userMention } from '@discordjs/builders';
import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { SkillsEnum } from '../../../lib/skilling/types';
import { PercentCounter } from '../../../lib/structures/PercentCounter';
import { ActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { minionName, userHasItemsEquippedAnywhere } from '../../../lib/util/minionUtils';
import resolveItems from '../../../lib/util/resolveItems';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';

export interface MoktangTaskOptions extends ActivityTaskOptions {
	qty: number;
}

const requiredPickaxes = resolveItems(['Crystal pickaxe', 'Volcanic pickaxe', 'Dwarven pickaxe', 'Dragon pickaxe']);

export async function moktangCommand(user: KlasaUser, channelID: bigint) {
	const timeToKill = new PercentCounter(Time.Minute * 20, 'time');
	const quantity = Math.floor(user.maxTripLength('Moktang') / timeToKill.value);
	const duration = timeToKill.value * quantity;

	const miningLevel = user.skillLevel(SkillsEnum.Mining);
	if (miningLevel < 85) return 'You need 85 Mining to fight Moktang.';
	if (!userHasItemsEquippedAnywhere(user, requiredPickaxes, false)) {
		return `You need to have one of these pickaxes equipped to fight Moktang: ${requiredPickaxes
			.map(itemNameFromID)
			.join(', ')}.`;
	}
	const miningLevelBoost = miningLevel - 84;
	timeToKill.add(true, miningLevelBoost, 'Mining level');

	await addSubTaskToActivityTask<MoktangTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		qty: quantity,
		duration,
		type: 'Moktang'
	});

	return `${user.minionName} is now off to kill Moktang ${quantity}x times, their trip will take ${formatDuration(
		duration
	)}.
**Boosts:** ${timeToKill.messages.join(', ')} ${spoiler(timeToKill.missed.join(', '))}`;
}

export const MOKTANG_ID = 391_241;

const BarTable = new LootTable().add('Bronze bar', 10).add('Iron bar', 10).add('Steel bar', 10);

const StoneSpiritTable = new LootTable()
	.add('Copper stone spirit')
	.add('Tin stone spirit')
	.add('Coal stone spirit')
	.add('Silver stone spirit')
	.add('Adamantite stone spirit')
	.add('Gold stone spirit')
	.add('Runite stone spirit');

const OreTable = new LootTable().add('Coal', 20).add('Iron ore', 10);

const MoktangLootTable = new LootTable()
	.tertiary(1024, 'Claws frame')
	.add(BarTable)
	.add(StoneSpiritTable, [2, 3])
	.add(OreTable);

export async function moktangActivity(data: MoktangTaskOptions) {
	const { userID, qty } = data;
	const klasaUser = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);

	let xpPer = klasaUser.skillLevel(SkillsEnum.Mining) * 2300;

	let loot = new Bank();

	for (let i = 0; i < qty; i++) {
		loot.add(MoktangLootTable.roll());
	}

	const xpStr = await klasaUser.addXP({
		skillName: SkillsEnum.Mining,
		amount: xpPer,
		duration: data.duration,
		multiplier: false,
		masterCapeBoost: true
	});
	let str = `${userMention(data.userID)}, ${minionName(
		mahojiUser
	)} finished killing ${qty}x Moktang. Received ${loot}.

${xpStr}`;

	handleTripFinish(
		klasaUser,
		data.channelID,
		str,
		[
			'k',
			{
				name: 'moktang'
			},
			true
		],
		undefined,
		data,
		null
	);
}
