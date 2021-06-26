import { noOp, shuffleArr } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { Emoji, Events } from '../../../lib/constants';
import { coxLog, metamorphPets } from '../../../lib/data/collectionLog';
import { createTeam } from '../../../lib/data/cox';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { RaidsTaskOptions } from '../../../lib/types/minions';
import { addBanks, filterBankFromArrayOfItems, roll } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import itemID from '../../../lib/util/itemID';
import resolveItems from '../../../lib/util/resolveItems';
import { sendToChannelID } from '../../../lib/util/webhook';

const notPurple = resolveItems(['Torn prayer scroll', 'Dark relic']);
const greenItems = resolveItems(['Twisted ancestral colour kit']);
const blueItems = resolveItems(['Metamorphic dust']);
const purpleButNotAnnounced = resolveItems(['Dexterous prayer scroll', 'Arcane prayer scroll']);

const purpleItems = [...Object.values(coxLog), ...metamorphPets].flat(2).filter(i => !notPurple.includes(i));

export default class extends Task {
	async run({ channelID, users, challengeMode, duration, leader }: RaidsTaskOptions) {
		const allUsers = await Promise.all(users.map(async u => this.client.users.fetch(u)));
		const team = await createTeam(allUsers, challengeMode);

		const loot = ChambersOfXeric.complete({
			challengeMode,
			timeToComplete: duration,
			team
		});

		let totalPoints = 0;
		for (const member of team) {
			totalPoints += member.personalPoints;
		}

		const totalLoot = new Bank();

		let resultMessage = `<@${leader}> Your ${
			challengeMode ? 'Challenge Mode Raid' : 'Raid'
		} has finished. The total amount of points your team got is ${totalPoints.toLocaleString()}.\n`;
		await Promise.all(
			allUsers.map(u => {
				if (challengeMode) {
					u.incrementMinigameScore('RaidsChallengeMode', 1);
				} else {
					u.incrementMinigameScore('Raids', 1);
				}
			})
		);

		for (let [userID, _userLoot] of Object.entries(loot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			const { personalPoints, deaths, deathChance } = team.find(u => u.id === user.id)!;

			user.settings.update(
				UserSettings.TotalCoxPoints,
				user.settings.get(UserSettings.TotalCoxPoints) + personalPoints
			);

			const userLoot = new Bank(_userLoot);
			if (
				challengeMode &&
				roll(50) &&
				user.settings.get(UserSettings.CollectionLogBank)[itemID('Metamorphic dust')]
			) {
				const { bank } = user.allItemsOwned();
				const unownedPet = shuffleArr(metamorphPets).find(pet => !bank[pet]);
				if (unownedPet) {
					userLoot.add(unownedPet);
				}
			}

			totalLoot.add(userLoot);

			const items = userLoot.items();

			const isPurple = items.some(([item]) => purpleItems.includes(item.id));
			const isGreen = items.some(([item]) => greenItems.includes(item.id));
			const isBlue = items.some(([item]) => blueItems.includes(item.id));
			const emote = isBlue ? Emoji.Blue : isGreen ? Emoji.Green : Emoji.Purple;
			if (items.some(([item]) => purpleItems.includes(item.id) && !purpleButNotAnnounced.includes(item.id))) {
				const itemsToAnnounce = filterBankFromArrayOfItems(purpleItems, userLoot.bank);
				this.client.emit(
					Events.ServerNotification,
					`${emote} ${user.username} just received **${new Bank(itemsToAnnounce)}** on their ${formatOrdinal(
						await user.getMinigameScore(challengeMode ? 'RaidsChallengeMode' : 'Raids')
					)} raid.`
				);
			}
			const str = isPurple ? `${emote} ||${userLoot}||` : userLoot.toString();
			const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');

			resultMessage += `\n${deathStr} **${user}** received: ${str} (${personalPoints?.toLocaleString()} pts, ${
				Emoji.Skull
			}${deathChance.toFixed(0)}%)`;
			await user.addItemsToBank(userLoot, true);
		}

		await this.client.settings.update(
			ClientSettings.EconomyStats.CoxLoot,
			addBanks([this.client.settings.get(ClientSettings.EconomyStats.CoxLoot), totalLoot.bank])
		);

		sendToChannelID(this.client, channelID, { content: resultMessage });
	}
}
