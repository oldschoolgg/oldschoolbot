import { spoiler, userMention } from '@discordjs/builders';
import { randInt, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import { dwarvenOutfit } from '../../../lib/data/CollectionsExport';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { MOKTANG_ID, MoktangLootTable } from '../../../lib/minions/data/killableMonsters/custom/bosses/Moktang';
import { trackLoot } from '../../../lib/settings/prisma';
import { SkillsEnum } from '../../../lib/skilling/types';
import { PercentCounter } from '../../../lib/structures/PercentCounter';
import { ActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { minionName, userHasItemsEquippedAnywhere } from '../../../lib/util/minionUtils';
import resolveItems from '../../../lib/util/resolveItems';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';

export interface MoktangTaskOptions extends ActivityTaskOptions {
	qty: number;
}

const requiredPickaxes = resolveItems(['Crystal pickaxe', 'Volcanic pickaxe', 'Dwarven pickaxe', 'Dragon pickaxe']);

export async function moktangCommand(user: KlasaUser, channelID: bigint, inputQuantity: number | undefined) {
	const timeToKill = new PercentCounter(Time.Minute * 15, 'time');
	const miningLevel = user.skillLevel(SkillsEnum.Mining);
	if (miningLevel < 105) return 'You need 105 Mining to fight Moktang.';
	if (!userHasItemsEquippedAnywhere(user, requiredPickaxes, false)) {
		return `You need to have one of these pickaxes equipped to fight Moktang: ${requiredPickaxes
			.map(itemNameFromID)
			.join(', ')}.`;
	}
	const totemsOwned = user.bank().amount('Moktang totem');
	if (totemsOwned === 0) return "You don't have any Moktang totems, you cannot summon the boss!";

	const miningLevelBoost = miningLevel - 84;
	timeToKill.add(true, 0 - miningLevelBoost, 'Mining level');
	timeToKill.add(userHasItemsEquippedAnywhere(user, 'Volcanic pickaxe'), -5, 'Volcanic pickaxe');
	timeToKill.add(
		userHasItemsEquippedAnywhere(user, 'Offhand volcanic pickaxe') && user.skillLevel(SkillsEnum.Strength) >= 100,
		-3,
		'Offhand volcanic pickaxe'
	);
	timeToKill.add(userHasItemsEquippedAnywhere(user, 'Mining master cape'), -5, 'Mining mastery');

	const maxCanDo = Math.floor(calcMaxTripLength(user, 'Moktang') / timeToKill.value);
	const quantity = Math.max(1, Math.min(totemsOwned, maxCanDo, inputQuantity ?? maxCanDo));
	const duration = timeToKill.value * quantity;

	let brewsRequiredPerKill = 5;
	const hasDwarven = userHasItemsEquippedAnywhere(user, dwarvenOutfit, true);
	if (hasDwarven) brewsRequiredPerKill -= 2;
	const totalBrewsRequired = brewsRequiredPerKill * quantity;
	const restoresNeeded = Math.max(1, Math.floor(totalBrewsRequired / 3));
	const cost = new Bank().add('Heat res. brew', totalBrewsRequired).add('Heat res. restore', restoresNeeded);
	cost.add('Moktang totem', quantity);

	if (!user.owns(cost))
		return `You don't have the required items to fight Moktang: ${cost}.${
			!hasDwarven ? ' Tip: Dwarven armor reduces the amount of brews needed.' : ''
		}`;

	await user.removeItemsFromBank(cost);
	await updateBankSetting(globalClient, 'moktang_cost', cost);
	await trackLoot({
		changeType: 'cost',
		cost,
		id: 'moktang',
		type: 'Monster'
	});

	await addSubTaskToActivityTask<MoktangTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		qty: quantity,
		duration,
		type: 'Moktang'
	});

	return `${user.minionName} is now off to kill Moktang ${quantity}x times, their trip will take ${formatDuration(
		duration
	)}. Removed ${cost}.
**Boosts:** ${timeToKill.messages.join(', ')} ${
		timeToKill.missed.length > 0 ? spoiler(timeToKill.missed.join(', ')) : ''
	}`;
}

export async function moktangActivity(data: MoktangTaskOptions) {
	const { userID, qty } = data;
	const klasaUser = await globalClient.fetchUser(userID);
	const mahojiUser = await mahojiUsersSettingsFetch(userID);

	await klasaUser.incrementMonsterScore(MOKTANG_ID, qty);
	const newKC = klasaUser.getKC(MOKTANG_ID);

	let loot = new Bank();

	for (let i = 0; i < qty; i++) {
		loot.add(MoktangLootTable.roll());
	}
	if (isDoubleLootActive(data.duration)) {
		loot.multiply(2);
	}

	const res = await klasaUser.addItemsToBank({ items: loot, collectionLog: true });
	await updateBankSetting(globalClient, 'moktang_loot', loot);
	await trackLoot({
		duration: data.duration,
		teamSize: 1,
		loot,
		type: 'Monster',
		changeType: 'loot',
		id: 'moktang',
		kc: qty
	});

	const xpStr = await klasaUser.addXP({
		skillName: SkillsEnum.Mining,
		amount: klasaUser.skillLevel(SkillsEnum.Mining) * 2000 * qty,
		duration: data.duration,
		multiplier: false,
		masterCapeBoost: true
	});

	const image = await makeBankImage({
		bank: res.itemsAdded,
		title: `Loot From ${qty} Moktang`,
		user: klasaUser,
		previousCL: res.previousCL
	});

	for (const item of resolveItems(['Igne gear frame', 'Mini moktang'])) {
		if (loot.has(item)) {
			globalClient.emit(
				Events.ServerNotification,
				`**${klasaUser.username}'s** minion just received their ${formatOrdinal(
					klasaUser.cl().amount(item)
				)} ${itemNameFromID(item)} on their ${formatOrdinal(randInt(newKC - qty, newKC))} kill!`
			);
		}
	}

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
		image.file.buffer,
		data,
		loot
	);
}
