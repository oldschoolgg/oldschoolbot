import { ComponentType } from 'discord.js';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { mahojiInformationalButtons } from '../../../lib/constants';
import { randomizeBank } from '../../../lib/randomizer';

export async function minionBuyCommand(user: MUser): CommandResponse {
	if (user.user.minion_hasBought) return 'You already have a minion!';

	await user.update({
		minion_hasBought: true,
		minion_bought_date: new Date(),
		minion_ironman: true
	});

	const starter = randomizeBank(
		user.id,
		new Bank({
			Shark: 300,
			'Saradomin brew(4)': 50,
			'Super restore(4)': 20,
			'Anti-dragon shield': 1,
			'Tiny lamp': 5,
			'Small lamp': 2,
			'Dragon bones': 50,
			'Clue scroll (beginner)': 10,
			'Equippable mystery box': 1,
			'Pet Mystery box': 1
		})
	);

	starter.add('Coins', 50_000_000);
	if (starter) {
		await user.addItemsToBank({ items: starter, collectionLog: false });
	}

	return {
		content: `You bought a **Randomizer** minion!

READ THIS MESSAGE https://discord.com/channels/342983479501389826/1058018685199061002/1058022397510430800

${starter !== null ? `**You received these starter items:** ${starter}.` : ''}`,
		components: [
			{
				type: ComponentType.ActionRow,
				components: mahojiInformationalButtons
			}
		]
	};
}
