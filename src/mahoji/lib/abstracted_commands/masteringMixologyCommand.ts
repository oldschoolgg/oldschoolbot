import { formatDuration, stringMatches } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import {
	getMixologyContractCost,
	getMixologyContractDuration,
	masteringMixologyBuyables,
	mixologyContractDuration,
	mixologyContracts,
	mixologyHerbs,
	mixologyHerbUseDuration
} from '../../../lib/minions/data/masteringMixology.js';
import { QuestID } from '../../../lib/minions/data/quests.js';
import type {
	MasteringMixologyContractActivityTaskOptions,
	MasteringMixologyContractCreatingTaskOptions
} from '../../../lib/types/minions.js';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength.js';

export async function MixologyPasteCreationCommand(
	user: MUser,
	channelID: string,
	herbName: string,
	optionQuantity?: number
) {
	const currentLevel = user.skillLevel('herblore');
	if (currentLevel < 60) return 'You need at least 60 Herblore to participate in the mixology.';

	if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		return `You need to complete the "Children of the Sun" quest before you can participate in the mixology. Send your minion to do the quest using: ${globalClient.mentionCommand(
			'activities',
			'quest'
		)}.`;
	}

	if (await user.minionIsBusy()) return `${user.minionName} is busy.`;

	const herb = mixologyHerbs.find(h => h.name.toLowerCase() === herbName.toLowerCase());
	if (!herb) {
		return 'That is not a valid herb for mixology paste.';
	}

	const bankQty = user.bank.amount(herb.name);
	if (bankQty === 0) {
		return `You don't have any ${herb.name} to convert into ${herb.paste} paste.`;
	}

	const maxTripLength = await calcMaxTripLength(user, 'MixologyPasteCreation');
	const maxByTime = Math.floor(maxTripLength / mixologyHerbUseDuration);
	const maxByItems = bankQty;

	let quantity = optionQuantity ?? Math.min(maxByTime, maxByItems);
	if (quantity < 1) {
		return `You don't have enough ${herb.name} or time to make any paste.`;
	}

	if (quantity > maxByItems) quantity = maxByItems;
	if (quantity > maxByTime) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}. Try a lower quantity. You can make up to ${maxByTime}x.`;
	}

	const pasteYield = quantity * herb.quantity;
	const duration = quantity * mixologyHerbUseDuration;
	const cost = new Bank().add(herb.name, quantity);

	if (!user.owns(cost)) {
		return `You're missing items to mix ${quantity}x ${herb.name}.`;
	}

	await user.removeItemsFromBank(cost);
	await ClientSettings.updateBankSetting('mastering_mixology_cost_bank', cost);

	await ActivityManager.startTrip<MasteringMixologyContractCreatingTaskOptions>({
		userID: user.id,
		channelId: channelID.toString(),
		type: 'MixologyPasteCreation',
		minigameID: 'mastering_mixology',
		herbName: herb.name,
		quantity,
		duration
	});

	return `You are using ${quantity}x ${herb.name} to create ${pasteYield}x ${herb.paste} paste. This will take ${formatDuration(
		duration
	)}.`;
}

export async function MasteringMixologyBuyCommand(user: MUser, input = '', quantity = 1) {
	const buyable = masteringMixologyBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy:\n\n${masteringMixologyBuyables
			.map(i => {
				const levelReq = i.requiredLevel ? ` (requires ${i.requiredLevel} Herblore)` : '';
				return `**${i.item.name}:** ${i.cost.Mox} Mox, ${i.cost.Aga} Aga, ${i.cost.Lye} Lye${levelReq}`;
			})
			.join('\n')}.`;
	}

	const currentLevel = user.skillLevel('herblore');
	if (buyable.requiredLevel && currentLevel < buyable.requiredLevel) {
		return `You need ${buyable.requiredLevel} Herblore to buy the ${buyable.item.name}.`;
	}

	const totalCost = {
		Mox: buyable.cost.Mox * quantity,
		Aga: buyable.cost.Aga * quantity,
		Lye: buyable.cost.Lye * quantity
	};

	if (
		user.user.mixology_mox_points < totalCost.Mox ||
		user.user.mixology_aga_points < totalCost.Aga ||
		user.user.mixology_lye_points < totalCost.Lye
	) {
		return (
			`You don't have enough Mixology points to buy ${quantity.toLocaleString()}x ${buyable.item.name}. ` +
			`You need ${totalCost.Mox} Mox, ${totalCost.Aga} Aga and ${totalCost.Lye} Lye points.`
		);
	}

	const loot = new Bank().add(buyable.item.id, quantity);
	await user.transactItems({
		itemsToAdd: loot,
		collectionLog: true,
		otherUpdates: {
			mixology_mox_points: { decrement: totalCost.Mox },
			mixology_aga_points: { decrement: totalCost.Aga },
			mixology_lye_points: { decrement: totalCost.Lye }
		}
	});

	return `Successfully purchased ${loot} for ${totalCost.Mox} Mox, ${totalCost.Aga} Aga and ${totalCost.Lye} Lye points.`;
}

export async function MasteringMixologyContractStartCommand(user: MUser, channelID: string, contracts?: number) {
	const currentLevel = user.skillLevel('herblore');

	if (currentLevel < 60) return 'You need at least 60 Herblore to participate in the mixology.';

	if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		return `You need to complete the "Children of the Sun" quest before you can participate in the mixology. Send your minion to do the quest using: ${globalClient.mentionCommand(
			'activities',
			'quest'
		)}.`;
	}

	const totalAvailable = mixologyContracts.filter(c => {
		const cost = getMixologyContractCost(c.pasteSequence);
		return currentLevel >= c.requiredLevel && user.bank.has(cost);
	}).length;
	if (totalAvailable === 0) {
		return `You're out of paste! Each contract requires 30 paste (3 batches of 10). \nCreate more using ${globalClient.mentionCommand(
			'minigames',
			'mastering_mixology',
			'create'
		)} before starting any contracts.`;
	}

	const maxTripLength = await calcMaxTripLength(user, 'MasteringMixologyContract');
	const maxContracts = Math.floor(maxTripLength / (mixologyContractDuration * 1.1));

	if (!contracts) {
		contracts = maxContracts;
	}

	if (contracts < 1 || contracts > maxContracts) {
		return `You can only complete between 1 and ${maxContracts} contracts based on your current max trip length.`;
	}
	let totalDuration = 0;
	for (let i = 0; i < contracts; i++) {
		totalDuration += getMixologyContractDuration(mixologyContractDuration);
	}
	const duration = Math.round(totalDuration);

	await ActivityManager.startTrip<MasteringMixologyContractActivityTaskOptions>({
		userID: user.id,
		channelId: channelID.toString(),
		type: 'MasteringMixologyContract',
		duration,
		minigameID: 'mastering_mixology',
		quantity: contracts
	});

	return `${user.minionName} is now attempting ${contracts} Mastering Mixology contract${contracts > 1 ? 's' : ''}. If enough paste is available, the trip will take ${formatDuration(duration)}.`;
}

export async function MasteringMixologyStatusCommand(user: MUser) {
	const { mixology_mox_points, mixology_aga_points, mixology_lye_points } = user.user;
	const moxPaste = user.bank.amount('Mox paste');
	const agaPaste = user.bank.amount('Aga paste');
	const lyePaste = user.bank.amount('Lye paste');
	const kc = await user.fetchMinigameScore('mastering_mixology');

	return `You have ${mixology_mox_points.toLocaleString()} Mox points, ${mixology_aga_points.toLocaleString()} Aga points and ${mixology_lye_points.toLocaleString()} Lye points.
You have ${moxPaste.toLocaleString()}x Mox paste, ${agaPaste.toLocaleString()}x Aga paste and ${lyePaste.toLocaleString()}x Lye paste.
You have completed ${kc} Mastering Mixology contracts.`;
}
