import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import { Time } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { getNewUser } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { determineRunes } from '../../../lib/util/determineRunes';
import getOSItem from '../../../lib/util/getOSItem';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { pizazzPointsPerHour } from '../../../tasks/minions/minigames/mageTrainingArenaActivity';

const RuneTable = new LootTable()
	.every('Law rune', [11, 14])
	.every('Cosmic rune', [18, 22])
	.every('Nature rune', [18, 22])
	.every('Fire rune', [35, 45]);

export const mageTrainingArenaBuyables = [
	{
		item: getOSItem('Infinity gloves'),
		cost: 420
	},
	{
		item: getOSItem('Infinity hat'),
		cost: 810
	},
	{
		item: getOSItem('Infinity top'),
		cost: 960
	},
	{
		item: getOSItem('Infinity bottoms'),
		cost: 1110
	},
	{
		item: getOSItem('Infinity boots'),
		cost: 280
	},
	{
		item: getOSItem('Beginner wand'),
		cost: 30
	},
	{
		item: getOSItem('Apprentice wand'),
		cost: 71,
		upgradesFrom: getOSItem('Beginner wand')
	},
	{
		item: getOSItem('Teacher wand'),
		cost: 143,
		upgradesFrom: getOSItem('Apprentice wand')
	},
	{
		item: getOSItem('Master wand'),
		cost: 575,
		upgradesFrom: getOSItem('Teacher wand')
	},
	{
		item: getOSItem("Mage's book"),
		cost: 1260
	}
];

export async function mageTrainingArenaBuyCommand(user: MUser, input = '') {
	const buyable = mageTrainingArenaBuyables.find(i => stringMatches(input, i.item.name));
	if (!buyable) {
		return `Here are the items you can buy: \n\n${mageTrainingArenaBuyables
			.map(i => `**${i.item.name}:** ${i.cost} points`)
			.join('\n')}.`;
	}

	const { item, cost, upgradesFrom } = buyable;
	const newUser = await getNewUser(user.id);
	const balance = newUser.pizazz_points;

	if (upgradesFrom && !user.owns(upgradesFrom.id)) {
		return `To buy a ${item.name}, you need to upgrade to it with a ${upgradesFrom.name}, which you do not own.`;
	}

	if (balance < cost) {
		return `You don't have enough Pizazz Points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`;
	}

	if (upgradesFrom) {
		await user.removeItemsFromBank(new Bank().add(upgradesFrom.id));
	}

	await prisma.newUser.update({
		where: {
			id: user.id
		},
		data: {
			pizazz_points: {
				decrement: cost
			}
		}
	});

	await user.addItemsToBank({ items: { [item.id]: 1 }, collectionLog: true });

	return `Successfully purchased 1x ${item.name} for ${cost} Pizazz Points.`;
}

export async function mageTrainingArenaPointsCommand(user: MUser) {
	const parsedUser = await getNewUser(user.id);

	return `You have **${parsedUser.pizazz_points.toLocaleString()}** Pizazz points.
**Pizazz Points Per Hour:** ${pizazzPointsPerHour}
${mageTrainingArenaBuyables
	.map(i => `${i.item.name} - ${i.cost} pts - ${formatDuration((i.cost / pizazzPointsPerHour) * (Time.Minute * 60))}`)
	.join('\n')}
        
Hint: Magic Training Arena is combined into 1 room, and 1 set of points - rewards take approximately the same amount of time to get. To get started use **/minigames mage_training_arena start**. You can buy rewards using **/minigames mage_training_arena buy**.`;
}

export async function mageTrainingArenaStartCommand(user: MUser, channelID: string): CommandResponse {
	if (user.minionIsBusy) return `${user.minionName} is currently busy.`;

	const roomDuration = Time.Minute * 14;
	const quantity = Math.floor(calcMaxTripLength(user, 'MageTrainingArena') / roomDuration);
	const duration = quantity * roomDuration;

	const cost = determineRunes(user, new Bank().add(RuneTable.roll())).multiply(quantity);

	if (!user.owns(cost)) {
		return `You don't have enough items for this trip, you need: ${cost}.`;
	}

	await transactItems({ userID: user.id, itemsToRemove: cost });

	await updateBankSetting('mta_cost', cost);

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'MageTrainingArena',
		quantity,
		minigameID: 'magic_training_arena'
	});

	return `${
		user.minionName
	} is now doing ${quantity} Magic Training Arena rooms. The trip will take around ${formatDuration(
		duration
	)}. Removed ${cost} from your bank.`;
}
