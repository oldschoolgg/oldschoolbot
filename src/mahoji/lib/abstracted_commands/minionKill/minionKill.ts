import type { ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';

import { handleDTD } from '../../../../lib/bso/handleDTD';
import { colosseumCommand } from '../../../../lib/colosseum';
import type { PvMMethod } from '../../../../lib/constants';
import { getCurrentPeak } from '../../../../lib/getCurrentPeak';
import { trackLoot } from '../../../../lib/lootTrack';
import { revenantMonsters } from '../../../../lib/minions/data/killableMonsters/revs';
import { getUsersCurrentSlayerInfo } from '../../../../lib/slayer/slayerUtil';
import type { MonsterActivityTaskOptions } from '../../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../../lib/util';
import addSubTaskToActivityTask from '../../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../../lib/util/calcMaxTripLength';
import findMonster from '../../../../lib/util/findMonster';
import { updateBankSetting } from '../../../../lib/util/updateBankSetting';
import { sendToChannelID } from '../../../../lib/util/webhook';
import { hasMonsterRequirements } from '../../../mahojiSettings';
import { igneCommand } from '../igneCommand';
import { kgCommand } from '../kgCommand';
import { kkCommand } from '../kkCommand';
import { moktangCommand } from '../moktangCommand';
import { naxxusCommand } from '../naxxusCommand';
import { nexCommand } from '../nexCommand';
import { nightmareCommand } from '../nightmareCommand';
import { getPOH } from '../pohCommand';
import { temporossCommand } from '../temporossCommand';
import { vasaCommand } from '../vasaCommand';
import { wintertodtCommand } from '../wintertodtCommand';
import { zalcanoCommand } from '../zalcanoCommand';
import { newMinionKillCommand } from './newMinionKill';

const invalidMonsterMsg = "That isn't a valid monster.\n\nFor example, `/k name:zulrah quantity:5`";

export async function minionKillCommand(
	user: MUser,
	interaction: ChatInputCommandInteraction,
	channelID: string,
	name: string,
	inputQuantity: number | undefined,
	method: PvMMethod | undefined,
	wilderness: boolean | undefined,
	_solo: boolean | undefined
): Promise<string | InteractionReplyOptions> {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const { minionName } = user;

	if (!name) return invalidMonsterMsg;

	if (user.usingPet('Ishi')) {
		sendToChannelID(channelID.toString(), {
			content: `${user} Ishi Says: Let's kill some ogress warriors instead? 🥰 🐳`
		});
		name = 'Ogress Warrior';
	}
	if (stringMatches(name, 'colosseum')) return colosseumCommand(user, channelID);
	if (stringMatches(name, 'zalcano')) return zalcanoCommand(user, channelID, inputQuantity);
	if (stringMatches(name, 'tempoross')) return temporossCommand(user, channelID, inputQuantity);
	if (name.toLowerCase().includes('nightmare')) return nightmareCommand(user, channelID, name, inputQuantity);
	if (name.toLowerCase().includes('wintertodt')) return wintertodtCommand(user, channelID);
	if (['igne ', 'ignecarus'].some(i => name.toLowerCase().includes(i))) {
		return igneCommand(interaction, user, channelID, name, inputQuantity);
	}
	if (['kg', 'king goldemar'].some(i => name.toLowerCase().includes(i))) {
		return kgCommand(interaction, user, channelID, name, inputQuantity);
	}
	if (['kk', 'kalphite king'].some(i => name.toLowerCase().includes(i)))
		return kkCommand(interaction, user, channelID, name, inputQuantity);
	if (name.toLowerCase().includes('nex')) return nexCommand(interaction, user, channelID, name, inputQuantity);
	if (name.toLowerCase().includes('moktang')) return moktangCommand(user, channelID, inputQuantity);
	if (name.toLowerCase().includes('naxxus')) return naxxusCommand(user, channelID, inputQuantity);
	if (['vasa', 'vasa magus'].some(i => name.toLowerCase().includes(i))) {
		return vasaCommand(user, channelID, inputQuantity);
	}

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

	const dtdResult = await handleDTD(monster, user);
	if (typeof dtdResult === 'string') {
		return dtdResult;
	}

	const stats: { pk_evasion_exp: number } = await user.fetchStats({ pk_evasion_exp: true });

	const result = newMinionKillCommand({
		gearBank: user.gearBank,
		attackStyles: user.getAttackStyles(),
		currentSlayerTask: await getUsersCurrentSlayerInfo(user.id),
		monster,
		isTryingToUseWildy: wilderness ?? false,
		monsterKC: await user.getKC(monster.id),
		inputPVMMethod: method,
		maxTripLength: calcMaxTripLength(user, 'MonsterKilling'),
		pkEvasionExperience: stats.pk_evasion_exp,
		poh: await getPOH(user.id),
		inputQuantity,
		combatOptions: user.combatOptions,
		slayerUnlocks: user.user.slayer_unlocks,
		favoriteFood: user.user.favorite_food,
		bitfield: user.bitfield,
		currentPeak: getCurrentPeak(),
		disabledInventions: user.user.disabled_inventions
	});

	if (typeof result === 'string') {
		return result;
	}

	if (!user.allItemsOwned.has(result.updateBank.itemCostBank)) {
		return `You don't have the items needed to kill this monster. You need: ${result.updateBank.itemCostBank}`;
	}

	const updateResult = await result.updateBank.transact(user, { isInWilderness: result.isInWilderness });
	if (typeof updateResult === 'string') {
		return updateResult;
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

	const { bob, usingCannon, cannonMulti, chinning, hasWildySupplies } = result.currentTaskOptions;
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
		hasWildySupplies,
		isInWilderness: result.isInWilderness,
		attackStyles: result.attackStyles
	});

	if (dtdResult) {
		return `<:deathtouched_dart:822674661967265843> ${user.minionName} used a **Deathtouched dart**.`;
	}

	let response = `${minionName} is now killing ${result.quantity}x ${monster.name}, it'll take around ${formatDuration(
		result.duration
	)} to finish. Attack styles used: ${result.attackStyles.join(', ')}.`;

	if (result.messages.length > 0) {
		response += `\n\n${result.messages.join(', ')}`;
	}

	return response;
}
