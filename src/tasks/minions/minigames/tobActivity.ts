import { formatOrdinal, miniID } from '@oldschoolgg/toolkit';
import { calcPercentOfNum, calcWhatPercent, objectEntries, roll, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { tobMetamorphPets } from '../../../lib/data/CollectionsExport';
import { TOBRooms, TOBUniques, TOBUniquesToAnnounce } from '../../../lib/data/tob';
import { trackLoot } from '../../../lib/lootTrack';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { TheatreOfBlood } from '../../../lib/simulation/tob';
import { SkillsEnum } from '../../../lib/skilling/types';
import { TheatreOfBloodTaskOptions } from '../../../lib/types/minions';
import { convertPercentChance } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsBankUpdate, userStatsUpdate } from '../../../mahoji/mahojiSettings';

const totalXPFromRaid = {
	[SkillsEnum.Attack]: 12_000,
	[SkillsEnum.Hitpoints]: 13_100,
	[SkillsEnum.Strength]: 12_000,
	[SkillsEnum.Ranged]: 1000,
	[SkillsEnum.Defence]: 12_000,
	[SkillsEnum.Magic]: 1000
} as const;

export const tobTask: MinionTask = {
	type: 'TheatreOfBlood',
	async run(data: TheatreOfBloodTaskOptions) {
		const {
			channelID,
			users,
			hardMode,
			leader,
			wipedRooms,
			duration,
			fakeDuration,
			deaths: allDeaths,
			quantity
		} = data;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u)));

		const minigameID = hardMode ? 'tob_hard' : 'tob';

		const allTag = allUsers.map(u => u.toString()).join('');
		const teamsLoot = new TeamLoot([]);
		const globalTobCost = new Bank();
		const totalLoot = new Bank();
		let wipeCount = 0;
		let earnedAttempts = 0;
		let resultMessage = `**${allTag} Your ${hardMode ? 'Hard Mode' : ''} Theatre of Blood has finished**\n`;

		for (let i = 0; i < quantity; i++) {
			const raidId = i + 1;
			const deaths = allDeaths[i];
			const wipedRoom = wipedRooms[i];
			const tobUsers = users.map((i, index) => ({ id: i, deaths: deaths[index] }));
			if (data.solo === 'trio') {
				tobUsers.push({ id: miniID(3), deaths: [] });
				tobUsers.push({ id: miniID(3), deaths: [] });
			}

			const result = TheatreOfBlood.complete({
				hardMode,
				team: tobUsers
			});

			// Give them all +1 attempts
			const diedToMaiden = wipedRoom !== null && wipedRoom === 0;
			if (!diedToMaiden) earnedAttempts++;

			// 100k tax if they wipe
			if (wipedRoom !== null) {
				wipeCount++;
				resultMessage += `\n${raidId}: Your team wiped in the Theatre of Blood, in the ${
					TOBRooms[wipedRoom].name
				} room!${diedToMaiden ? ' The team died very early, and nobody learnt much from this raid.' : ''}`;
				// They each paid 100k tax, it doesn't get refunded, so track it in economy stats.
				globalTobCost.add('Coins', users.length * 100_000);
				continue;
			}

			resultMessage += `\n${raidId}: Unique chance: ${result.percentChanceOfUnique.toFixed(
				2
			)}% (1 in ${convertPercentChance(result.percentChanceOfUnique)})`;

			// Track loot for T3+ patrons
			await Promise.all(
				allUsers.map(user => {
					return userStatsBankUpdate(user.id, 'tob_loot', new Bank(result.loot[user.id]));
				})
			);

			for (let [userID, _userLoot] of Object.entries(result.loot)) {
				if (data.solo && userID !== leader) continue;
				const user = allUsers.find(i => i.id === userID);
				if (!user) continue;
				const userDeaths = deaths[users.indexOf(user.id)];

				const userLoot = new Bank(_userLoot);
				if (roll(100)) {
					userLoot.add('Clue scroll (grandmaster)');
				}

				// Merge existing loot to prevent duplicate pets:
				const bank = user.allItemsOwned.clone().add(teamsLoot.get(userID));

				const { cl } = user;
				if (hardMode && roll(30) && cl.has("Lil' zik") && cl.has('Sanguine dust')) {
					const unownedPet = shuffleArr(tobMetamorphPets).find(pet => !bank.has(pet));
					if (unownedPet) {
						userLoot.add(unownedPet);
					}
				}
				// Refund initial 100k entry cost
				userLoot.add('Coins', 100_000);

				// Add this raids loot to the raid's total loot:
				totalLoot.add(userLoot);

				// Add this raids loot to user's total loot:
				teamsLoot.add(userID, userLoot);

				const items = userLoot.items();

				const isPurple = items.some(([item]) => TOBUniques.includes(item.id));
				const shouldAnnounce = items.some(([item]) => TOBUniquesToAnnounce.includes(item.id));
				if (shouldAnnounce) {
					const itemsToAnnounce = userLoot.filter(item => TOBUniques.includes(item.id), false);
					globalClient.emit(
						Events.ServerNotification,
						`${Emoji.Purple} ${
							user.badgedUsername
						} just received **${itemsToAnnounce}** on their ${formatOrdinal(
							(await getMinigameScore(user.id, minigameID)) + (raidId - wipeCount)
						)} raid.`
					);
				}
				const deathStr =
					userDeaths.length === 0 ? '' : `${Emoji.Skull}(${userDeaths.map(i => TOBRooms[i].name)})`;

				const lootStr = userLoot.remove('Coins', 100_000).toString();
				const str = isPurple ? `${Emoji.Purple} ||${lootStr.padEnd(30, ' ')}||` : `||${lootStr}||`;

				resultMessage += `\n${raidId}: ${deathStr}**${user}** received: ${str}`;
			}
		}
		// Give everyone their loot:
		await Promise.all(
			allUsers.map(u => {
				u.addItemsToBank({ items: teamsLoot.get(u.id), collectionLog: true });
			})
		);

		// Give them their earned attempts:
		if (earnedAttempts > 0) {
			await Promise.all(
				allUsers.map(u => {
					const key = hardMode ? 'tob_hard_attempts' : 'tob_attempts';
					return userStatsUpdate(u.id, {
						[key]: {
							increment: earnedAttempts
						}
					});
				})
			);
		}
		const successfulRaidCount = quantity - wipeCount;
		if (successfulRaidCount > 0) {
			await Promise.all(allUsers.map(u => incrementMinigameScore(u.id, minigameID, successfulRaidCount)));
		}
		if (wipeCount > 0) {
			// Update economy stats:
			await updateBankSetting('tob_cost', globalTobCost);
		}
		// Add XP
		await Promise.all(
			allUsers.map(u =>
				Promise.all(
					objectEntries(totalXPFromRaid).map(val =>
						u.addXP({
							skillName: val[0],
							amount: calcPercentOfNum(calcWhatPercent(duration, fakeDuration), val[1]),
							source: 'TheatreOfBlood'
						})
					)
				)
			)
		);

		await updateBankSetting('tob_loot', totalLoot);
		await trackLoot({
			totalLoot,
			id: minigameID,
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: successfulRaidCount,
			users: allUsers.map(i => ({
				id: i.id,
				loot: teamsLoot.get(i.id),
				duration
			}))
		});

		return handleTripFinish(allUsers[0], channelID, resultMessage, undefined, data, null, undefined);
	}
};
