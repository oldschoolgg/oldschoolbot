import { noOp } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { createTOBTeam, TOBRooms, TOBUniques } from '../../../lib/data/tob';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { TheatreOfBlood } from '../../../lib/simulation/tob';
import { TheatreOfBloodTaskOptions } from '../../../lib/types/minions';
import { convertPercentChance, filterBankFromArrayOfItems, updateBankSetting } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { sendToChannelID } from '../../../lib/util/webhook';

export default class extends Task {
	async run(data: TheatreOfBloodTaskOptions) {
		const { channelID, users, hardMode, leader } = data;
		const allUsers = await Promise.all(users.map(async u => this.client.fetchUser(u)));
		const team = await createTOBTeam({ team: allUsers, hardMode });

		const result = TheatreOfBlood.complete({
			hardMode,
			team: team.parsedTeam.map(t => ({ id: t.id, deaths: t.deaths }))
		});

		const totalLoot = new Bank();

		let resultMessage = `<@${leader}> Your ${hardMode ? 'Hard Mode Raid' : 'Raid'} has finished.

Unique chance: ${result.percentChanceOfUnique.toFixed(2)}% (1 in ${convertPercentChance(result.percentChanceOfUnique)})
Total Deaths: ${result.totalDeaths}

`;
		await Promise.all(allUsers.map(u => incrementMinigameScore(u.id, hardMode ? 'tob_hard' : 'tob', 1)));

		for (let [userID, _userLoot] of Object.entries(result.loot)) {
			const user = await this.client.fetchUser(userID).catch(noOp);
			if (!user) continue;
			const { deaths } = team.parsedTeam.find(u => u.id === user.id)!;

			const userLoot = new Bank(_userLoot);

			totalLoot.add(userLoot);

			const items = userLoot.items();

			const isPurple = items.some(([item]) => TOBUniques.includes(item.id));

			if (isPurple) {
				const itemsToAnnounce = filterBankFromArrayOfItems(TOBUniques, userLoot.bank);
				this.client.emit(
					Events.ServerNotification,
					`${Emoji.Purple} ${user.username} just received **${new Bank(
						itemsToAnnounce
					)}** on their ${formatOrdinal(await user.getMinigameScore(hardMode ? 'tob_hard' : 'tob'))} raid.`
				);
			}
			const str = isPurple ? `${Emoji.Purple} ||${userLoot}||` : userLoot.toString();
			const deathStr = deaths.length === 0 ? '' : `${Emoji.Skull}(${deaths.map(i => TOBRooms[i].name)})`;

			resultMessage += `\n${deathStr}**${user}** received: ${str}`;
			await user.addItemsToBank(userLoot, true);
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.TOBLoot, totalLoot.bank);

		sendToChannelID(this.client, channelID, { content: resultMessage });
	}
}
