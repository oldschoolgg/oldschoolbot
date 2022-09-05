import { calcPercentOfNum, calcWhatPercent, noOp, objectEntries, roll, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { tobMetamorphPets } from '../../../lib/data/CollectionsExport';
import { TOBRooms, TOBUniques, TOBUniquesToAnnounce, totalXPFromRaid } from '../../../lib/data/tob';
import { trackLoot } from '../../../lib/settings/prisma';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { TheatreOfBlood } from '../../../lib/simulation/tob';
import { MinionTask } from '../../../lib/Task';
import { TheatreOfBloodTaskOptions } from '../../../lib/types/minions';
import { convertPercentChance } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../../lib/util/webhook';
import { mUserFetch, updateBankSetting, updateLegacyUserBankSetting } from '../../../mahoji/mahojiSettings';

export const tobTask: MinionTask = {
	type: 'TheatreOfBlood',
	async run(data: TheatreOfBloodTaskOptions) {
		const { channelID, users, hardMode, leader, wipedRoom, duration, fakeDuration, deaths } = data;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u)));
		const result = TheatreOfBlood.complete({
			hardMode,
			team: users.map((i, index) => ({ id: i, deaths: deaths[index] }))
		});

		const minigameID = hardMode ? 'tob_hard' : 'tob';

		const allTag = allUsers.map(u => u.toString()).join('');

		// Add XP
		await Promise.all(
			allUsers.map(u =>
				Promise.all(
					objectEntries(totalXPFromRaid).map(val =>
						u.addXP({
							skillName: val[0],
							amount: wipedRoom
								? val[1]
								: calcPercentOfNum(calcWhatPercent(duration, fakeDuration), val[1])
						})
					)
				)
			)
		);

		// Give them all +1 attempts
		const diedToMaiden = wipedRoom !== null && wipedRoom === 0;
		if (!diedToMaiden) {
			await Promise.all(
				allUsers.map(u => {
					return u.update({
						[hardMode ? 'tob_hard_attempts' : 'tob_attempts']: {
							increment: 1
						}
					});
				})
			);
		}

		// GIVE XP HERE
		// 100k tax if they wipe
		if (wipedRoom !== null) {
			sendToChannelID(channelID, {
				content: `${allTag} Your team wiped in the Theatre of Blood, in the ${TOBRooms[wipedRoom].name} room!${
					diedToMaiden ? ' The team died very early, and nobody learnt much from this raid.' : ''
				}`
			});
			// They each paid 100k tax, it doesn't get refunded, so track it in economy stats.
			await updateBankSetting('tob_cost', new Bank().add('Coins', users.length * 100_000));
			return;
		}

		// Track loot for T3+ patrons
		await Promise.all(
			allUsers.map(user => {
				return updateLegacyUserBankSetting(user.id, 'tob_loot', new Bank(result.loot[user.id]));
			})
		);

		const totalLoot = new Bank();

		let resultMessage = `**<@${leader}> Your ${hardMode ? 'Hard Mode' : ''} Theatre of Blood has finished**

Unique chance: ${result.percentChanceOfUnique.toFixed(2)}% (1 in ${convertPercentChance(result.percentChanceOfUnique)})
`;
		await Promise.all(allUsers.map(u => incrementMinigameScore(u.id, minigameID, 1)));

		for (let [userID, _userLoot] of Object.entries(result.loot)) {
			const user = await mUserFetch(userID).catch(noOp);
			if (!user) continue;
			const userDeaths = deaths[users.indexOf(user.id)];

			const userLoot = new Bank(_userLoot);
			const bank = user.allItemsOwned();

			const { cl } = user;
			if (hardMode && roll(30) && cl.has("Lil' zik") && cl.has('Sanguine dust')) {
				const unownedPet = shuffleArr(tobMetamorphPets).find(pet => !bank.has(pet));
				if (unownedPet) {
					userLoot.add(unownedPet);
				}
			}

			const { itemsAdded } = await transactItems({
				userID: user.id,
				itemsToAdd: userLoot.clone().add('Coins', 100_000),
				collectionLog: true
			});

			totalLoot.add(itemsAdded);

			const items = itemsAdded.items();

			const isPurple = items.some(([item]) => TOBUniques.includes(item.id));
			const shouldAnnounce = items.some(([item]) => TOBUniquesToAnnounce.includes(item.id));
			if (shouldAnnounce) {
				const itemsToAnnounce = itemsAdded.filter(item => TOBUniques.includes(item.id), false);
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Purple} ${
						user.usernameOrMention
					} just received **${itemsToAnnounce}** on their ${formatOrdinal(
						await getMinigameScore(user.id, minigameID)
					)} raid.`
				);
			}
			const deathStr = userDeaths.length === 0 ? '' : `${Emoji.Skull}(${userDeaths.map(i => TOBRooms[i].name)})`;

			const lootStr = itemsAdded.remove('Coins', 100_000).toString();
			const str = isPurple ? `${Emoji.Purple} ||${lootStr.padEnd(30, ' ')}||` : `||${lootStr}||`;

			resultMessage += `\n${deathStr}**${user}** received: ${str}`;
		}

		updateBankSetting('tob_loot', totalLoot);
		await trackLoot({
			loot: totalLoot,
			id: minigameID,
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: 1,
			teamSize: users.length
		});

		handleTripFinish(
			allUsers[0],
			channelID,
			resultMessage,
			[
				'raid',
				{
					tob: {
						start: {
							hard_mode: hardMode,
							max_team_size: allUsers.length
						}
					}
				},
				true
			],
			undefined,
			data,
			null
		);
	}
};
