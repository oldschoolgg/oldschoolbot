import { randArrItem, sumArr, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';

import { drawChestLootImage } from '../../../lib/bankImage';
import { Emoji, Events } from '../../../lib/constants';
import { toaCL } from '../../../lib/data/CollectionsExport';
import { trackLoot } from '../../../lib/lootTrack';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { calcTOALoot, toaOrnamentKits, toaPetTransmogItems } from '../../../lib/simulation/toa';
import { TOAOptions } from '../../../lib/types/minions';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsBankUpdate, userStatsUpdate } from '../../../mahoji/mahojiSettings';

const purpleButNotAnnounced = resolveItems(['Dexterous prayer scroll', 'Arcane prayer scroll']);
const purpleItems = resolveItems([
	"Tumeken's guardian",
	"Tumeken's shadow (uncharged)",
	"Elidinis' ward",
	'Masori mask',
	'Masori body',
	'Masori chaps',
	'Lightbearer',
	"Osmumten's fang"
]);

interface RaidResultUser {
	points: number;
	mUser: MUser;
	deaths: number;
	kc: number;
}

export const toaTask: MinionTask = {
	type: 'TombsOfAmascut',
	async run(data: TOAOptions) {
		const { channelID, users, raidLevel, duration, leader, quantity, wipedRoom } = data;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u[0])));

		const previousCLs = allUsers.map(i => i.cl.clone());

		console.log(
			allUsers.map(i => i.rawUsername),
			users.map(i => i[0])
		);

		// Increment all users attempts
		await Promise.all(
			allUsers.map(i =>
				userStatsUpdate(i.id, () => ({
					toa_attempts: {
						increment: quantity
					}
				}))
			)
		);
		if (wipedRoom) {
			return handleTripFinish(
				allUsers[0],
				channelID,
				`${allUsers.map(i => i.toString()).join(' ')} Your team wiped in the Tombs of Amascut!`,
				undefined,
				data,
				null,
				undefined
			);
		}

		const totalLoot = new TeamLoot(toaCL);

		const raidResults: Map<string, RaidResultUser> = new Map();
		for (const user of allUsers) {
			raidResults.set(user.id, {
				mUser: user,
				points: 0,
				deaths: 0,
				kc: await getMinigameScore(user.id, 'tombs_of_amascut')
			});
		}

		let messages: string[] = [];

		for (let x = 0; x < quantity; x++) {
			const raidLoot = calcTOALoot({
				users: users.map(i => {
					const fullUser = allUsers.find(u => u.id === i[0])!;
					return {
						id: i[0],
						points: i[1][x],
						cl: fullUser.cl,
						kc: raidResults.get(i[0])!.kc,
						deaths: i[2][x]
					};
				}),
				raidLevel
			});
			for (const [id, points, deaths] of users) {
				const currentUser = raidResults.get(id)!;
				currentUser.points += points[x];
				currentUser.deaths += deaths[x].length;
				currentUser.kc += 1;
				raidResults.set(id, currentUser);
			}
			for (const [userID, userLoot] of raidLoot.teamLoot.entries()) {
				totalLoot.add(userID, userLoot);
			}
			messages.push(...raidLoot.messages);
		}
		messages = uniqueArr(messages);
		const totalPoints = sumArr(Array.from(raidResults.values()).map(i => i.points));

		let resultMessage = `<@${leader}> Your Raid${
			quantity > 1 ? 's have' : ' has'
		} finished. The total amount of points your team got is ${totalPoints.toLocaleString()}.\n`;
		await Promise.all(allUsers.map(u => incrementMinigameScore(u.id, 'tombs_of_amascut', quantity)));

		for (let [userID, userData] of raidResults.entries()) {
			const { points, deaths, mUser: user } = userData;
			await userStatsUpdate(user.id, () => ({
				total_toa_points: {
					increment: points
				}
			}));

			// If the user already has these in their bank they cannot get another
			for (const itemID of [...toaPetTransmogItems, ...toaOrnamentKits.map(i => i[0].id)]) {
				const fullUser = allUsers.find(u => u.id === userID)!;
				const userLoot = totalLoot.get(userID);
				if (fullUser.bank.has(itemID) && userLoot.has(itemID)) {
					totalLoot.remove(user.id, itemID, userLoot.amount(itemID));
				}
			}

			const { itemsAdded } = await transactItems({
				userID,
				itemsToAdd: totalLoot.get(userID),
				collectionLog: true
			});

			await userStatsBankUpdate(user.id, 'toa_raid_levels_bank', new Bank().add(raidLevel, quantity));

			const items = itemsAdded.items();

			const isPurple = items.some(([item]) => purpleItems.includes(item.id));
			if (items.some(([item]) => purpleItems.includes(item.id) && !purpleButNotAnnounced.includes(item.id))) {
				const itemsToAnnounce = itemsAdded.filter(item => purpleItems.includes(item.id), false);
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Purple} ${
						user.badgedUsername
					} just received **${itemsToAnnounce}** on their ${formatOrdinal(
						await getMinigameScore(user.id, 'tombs_of_amascut')
					)} raid.`
				);
			}
			const str = isPurple ? `${Emoji.Purple} ||${itemsAdded}||` : itemsAdded.toString();
			const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');

			resultMessage += `\n${deathStr} **${user}** received: ${str} (${points.toLocaleString()} pts, ${
				Emoji.Skull
			})`;
		}

		if (messages.length > 0) {
			resultMessage += `\n\n${messages.join('\n')}`;
		}

		updateBankSetting('toa_loot', totalLoot.totalLoot());
		await trackLoot({
			totalLoot: totalLoot.totalLoot(),
			id: 'tombs_of_amascut',
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: quantity,
			users: allUsers.map(i => ({
				id: i.id,
				duration,
				loot: totalLoot.get(i.id)
			}))
		});

		totalLoot.add(allUsers[0].id, new Bank().add(randArrItem(toaCL)));

		if (users.length === 1) {
			const user = allUsers[0];
			let soloMsg = `${user}, your minion finished a Tombs of Amascut raid!
Your KC is now ${await getMinigameScore(user.id, 'tombs_of_amascut')}.`;
			if (messages.length > 0) {
				soloMsg += `\n${messages.join('\n')}`;
			}
			return handleTripFinish(
				allUsers[0],
				channelID,
				soloMsg,
				await drawChestLootImage({
					entries: [
						{
							loot: totalLoot.totalLoot(),
							user: allUsers[0],
							previousCL: previousCLs[0]
						}
					],
					type: 'Tombs of Amascut'
				}),
				data,
				null
			);
		}

		handleTripFinish(
			allUsers[0],
			channelID,
			resultMessage,
			await drawChestLootImage({
				entries: allUsers.map((u, index) => ({
					loot: totalLoot.get(u.id),
					user: u,
					previousCL: previousCLs[index]
				})),
				type: 'Tombs of Amascut'
			}),
			data,
			null
		);
	}
};
