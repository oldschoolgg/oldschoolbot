import { spoiler, userMention } from '@discordjs/builders';
import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { MysteryBoxes } from '../../../lib/bsoOpenables';
import { dwarvenOutfit } from '../../../lib/data/CollectionsExport';
import { Createable } from '../../../lib/data/createables';
import { MaterialBank } from '../../../lib/invention/MaterialBank';
import {
	ClueTable,
	FletchingTipsTable,
	lowRuneHighAdamantTable,
	runeWeaponTable,
	StoneSpiritTable
} from '../../../lib/simulation/sharedTables';
import { SkillsEnum } from '../../../lib/skilling/types';
import { PercentCounter } from '../../../lib/structures/PercentCounter';
import { ActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { minionName, userHasItemsEquippedAnywhere } from '../../../lib/util/minionUtils';
import resolveItems from '../../../lib/util/resolveItems';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';

export const moktangCreatables: Createable[] = [
	{
		name: 'Volcanic pickaxe',
		inputItems: new Bank({
			'Volcanic shards': 2,
			'Dwarven pickaxe': 1,
			'Obsidian shards': 250
		}),
		outputItems: new Bank({ 'Volcanic pickaxe': 1 })
	},
	{
		name: 'Offhand volcanic pickaxe',
		inputItems: new Bank({
			'Volcanic shards': 1,
			'Dwarven pickaxe': 1,
			'Obsidian shards': 150
		}),
		outputItems: new Bank({ 'Offhand volcanic pickaxe': 1 })
	},
	{
		name: 'Moktang totem',
		inputItems: new Bank({
			'Elder rune': 3
		}),
		outputItems: new Bank({ 'Moktang totem': 1 }),
		materialCost: new MaterialBank({
			rocky: 500,
			magic: 50
		})
	},
	{
		name: 'Volcanic bar',
		inputItems: new Bank({
			'Volcanic shards': 3
		}),
		outputItems: new Bank({ 'Moktang totem': 1 }),
		materialCost: new MaterialBank({
			rocky: 500,
			magic: 50
		})
	}
];

export interface MoktangTaskOptions extends ActivityTaskOptions {
	qty: number;
}

const requiredPickaxes = resolveItems(['Crystal pickaxe', 'Volcanic pickaxe', 'Dwarven pickaxe', 'Dragon pickaxe']);

export async function moktangCommand(user: KlasaUser, channelID: bigint, inputQuantity: number | undefined) {
	const timeToKill = new PercentCounter(Time.Minute * 15, 'time');
	const miningLevel = user.skillLevel(SkillsEnum.Mining);
	if (miningLevel < 85) return 'You need 85 Mining to fight Moktang.';
	if (!userHasItemsEquippedAnywhere(user, requiredPickaxes, false)) {
		return `You need to have one of these pickaxes equipped to fight Moktang: ${requiredPickaxes
			.map(itemNameFromID)
			.join(', ')}.`;
	}
	const miningLevelBoost = miningLevel - 84;
	timeToKill.add(true, 0 - miningLevelBoost, 'Mining level');
	timeToKill.add(userHasItemsEquippedAnywhere(user, 'Volcanic pickaxe'), -5, 'Volcanic pickaxe');
	timeToKill.add(userHasItemsEquippedAnywhere(user, 'Offhand volcanic pickaxe'), -3, 'Offhand volcanic pickaxe');
	timeToKill.add(userHasItemsEquippedAnywhere(user, 'Mining master cape'), -5, 'Mining mastery');

	const maxCanDo = Math.floor(user.maxTripLength('Moktang') / timeToKill.value);
	const quantity = Math.min(maxCanDo, inputQuantity ?? maxCanDo);
	const duration = timeToKill.value * quantity;

	let brewsRequiredPerKill = 4;
	const hasDwarven = userHasItemsEquippedAnywhere(user, dwarvenOutfit, true);
	if (hasDwarven) brewsRequiredPerKill -= 2;
	const totalBrewsRequired = brewsRequiredPerKill * quantity;
	const restoresNeeded = Math.max(1, Math.floor(totalBrewsRequired / 3));
	const cost = new Bank().add('Heat res. brew', totalBrewsRequired).add('Heat res. restore', restoresNeeded);
	if (!user.owns(cost))
		return `You don't have the required items to fight Moktang: ${cost}.${
			!hasDwarven ? ' Tip: Dwarven armor reduces the amount of brews needed.' : ''
		}`;

	await user.removeItemsFromBank(cost);
	await updateBankSetting(globalClient, 'moktang_cost', cost);

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

export const MoktangLootTable = new LootTable()
	.tertiary(1536, 'Mini moktang')
	.tertiary(1200, 'Volcanic dye')
	.tertiary(1024, 'Claws frame')
	.tertiary(128, 'Volcanic shards')
	.tertiary(5, ClueTable)
	.tertiary(16, MysteryBoxes)
	.add(BarTable)
	.add(lowRuneHighAdamantTable)
	.add(StoneSpiritTable, [2, 5])
	.add(FletchingTipsTable)
	.add(runeWeaponTable);

export async function moktangActivity(data: MoktangTaskOptions) {
	const { userID, qty } = data;
	const klasaUser = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);

	let xpPer = klasaUser.skillLevel(SkillsEnum.Mining) * 1300;

	let loot = new Bank();

	for (let i = 0; i < qty; i++) {
		loot.add(MoktangLootTable.roll());
	}

	await klasaUser.addItemsToBank({ items: loot, collectionLog: true });
	await updateBankSetting(globalClient, 'moktang_loot', loot);

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
