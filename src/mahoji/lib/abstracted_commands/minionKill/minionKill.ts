import { formatDuration, stringMatches } from '@oldschoolgg/toolkit/util';
import type { ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';
import { Monsters } from 'oldschooljs';

import { colosseumCommand } from '@/lib/colosseum.js';
import type { PvMMethod } from '@/lib/constants.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { revenantMonsters } from '@/lib/minions/data/killableMonsters/revs.js';
import { getUsersCurrentSlayerInfo } from '@/lib/slayer/slayerUtil.js';
import type { MonsterActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import findMonster from '@/lib/util/findMonster.js';
import { generateDailyPeakIntervals } from '@/lib/util/peaks.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import { hasMonsterRequirements } from '../../../mahojiSettings.js';
import { nexCommand } from '../nexCommand.js';
import { nightmareCommand } from '../nightmareCommand.js';
import { getPOH } from '../pohCommand.js';
import { temporossCommand } from '../temporossCommand.js';
import { wintertodtCommand } from '../wintertodtCommand.js';
import { zalcanoCommand } from '../zalcanoCommand.js';
import { newMinionKillCommand } from './newMinionKill.js';

const invalidMonsterMsg = "That isn't a valid monster.\n\nFor example, `/k name:zulrah quantity:5`";

export async function minionKillCommand(
	user: MUser,
	interaction: ChatInputCommandInteraction,
	channelID: string,
	name: string,
	inputQuantity: number | undefined,
	method: PvMMethod | undefined,
	wilderness: boolean | undefined,
	solo: boolean | undefined,
	onTask: boolean | undefined
): Promise<string | InteractionReplyOptions> {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const { minionName } = user;

	if (!name) return invalidMonsterMsg;

	if (stringMatches(name, 'colosseum')) return colosseumCommand(user, channelID);
	if (stringMatches(name, 'nex')) return nexCommand(interaction, user, channelID, solo);
	if (stringMatches(name, 'zalcano')) return zalcanoCommand(user, channelID, inputQuantity);
	if (stringMatches(name, 'tempoross')) return temporossCommand(user, channelID, inputQuantity);
	if (name.toLowerCase().includes('nightmare')) return nightmareCommand(user, channelID, name, inputQuantity);
	if (name.toLowerCase().includes('wintertodt')) return wintertodtCommand(user, channelID, inputQuantity);

	let monster = findMonster(name);

	const matchedRevenantMonster = revenantMonsters.find(monster =>
		monster.aliases.some(alias => stringMatches(alias, name))
	);
	if (matchedRevenantMonster) {
		monster = matchedRevenantMonster;
	}

	if (!monster) return invalidMonsterMsg;

	const [hasReqs, reason] = await hasMonsterRequirements(user, monster);
	if (!hasReqs) {
		return typeof reason === 'string' ? reason : "You don't have the requirements to fight this monster";
	}

	const slayerInfo = await getUsersCurrentSlayerInfo(user.id);

	if (slayerInfo.assignedTask === null && onTask) return 'You are no longer on a slayer task for this monster!';

	const stats: { pk_evasion_exp: number } = await user.fetchStats({ pk_evasion_exp: true });

	const royalTitansGroupIDs = [Monsters.Branda.id, Monsters.Eldric.id, Monsters.RoyalTitans.id];

	const kcs = await user.getAllKCs();
	let kcForBonus = kcs[monster.id];

	if (royalTitansGroupIDs.includes(monster.id)) {
		kcForBonus = kcs.BRANDA + kcs.ELDRIC + kcs.ROYAL_TITANS;
	}

	const result = newMinionKillCommand({
		gearBank: user.gearBank,
		attackStyles: user.getAttackStyles(),
		currentSlayerTask: slayerInfo,
		monster,
		isTryingToUseWildy: wilderness ?? false,
		monsterKC: kcForBonus,
		inputPVMMethod: method,
		maxTripLength: calcMaxTripLength(user, 'MonsterKilling'),
		pkEvasionExperience: stats.pk_evasion_exp,
		poh: await getPOH(user.id),
		inputQuantity,
		combatOptions: user.combatOptions,
		slayerUnlocks: user.user.slayer_unlocks,
		favoriteFood: user.user.favorite_food,
		bitfield: user.bitfield,
		currentPeak: generateDailyPeakIntervals().currentPeak
	});

	if (typeof result === 'string') {
		return result;
	}

	if (!user.allItemsOwned.has(result.updateBank.itemCostBank)) {
		return `You don't have the items needed to kill this monster. You're missing: ${result.updateBank.itemCostBank.clone().remove(user.allItemsOwned)}`;
	}

	const updateResult = await result.updateBank.transact(user);
	if (typeof updateResult === 'string') {
		return updateResult;
	}

	if (updateResult.message.length > 0) result.messages.push(updateResult.message);

	if (updateResult.totalCost.length > 0) {
		result.messages.push(`Removing items: ${updateResult.totalCost}`);
	}

	if (result.updateBank.itemCostBank.length > 0) {
		await updateBankSetting('economyStats_PVMCost', result.updateBank.itemCostBank);
		await trackLoot({
			id: monster.name,
			totalCost: result.updateBank.itemCostBank,
			type: 'Monster',
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost: result.updateBank.itemCostBank
				}
			]
		});
	}

	const { bob, usingCannon, cannonMulti, chinning, died, pkEncounters, hasWildySupplies } = result.currentTaskOptions;
	await addSubTaskToActivityTask<MonsterActivityTaskOptions>({
		mi: monster.id,
		userID: user.id,
		channelID,
		q: result.quantity,
		iQty: inputQuantity,
		duration: result.duration,
		type: 'MonsterKilling',
		usingCannon: !usingCannon ? undefined : usingCannon,
		cannonMulti: !cannonMulti ? undefined : cannonMulti,
		chinning: !chinning ? undefined : chinning,
		bob: !bob ? undefined : bob,
		died,
		pkEncounters,
		hasWildySupplies,
		isInWilderness: result.isInWilderness === true ? true : undefined,
		attackStyles: result.attackStyles,
		onTask: slayerInfo.assignedTask !== null
	});
	let response = `${minionName} is now killing ${result.quantity}x ${monster.name}, it'll take around ${formatDuration(
		result.duration
	)} to finish. Attack styles used: ${result.attackStyles.join(', ')}.`;

	if (result.messages.length > 0) {
		response += `\n\n${result.messages.join(', ')}`;
	}

	return response;
}
