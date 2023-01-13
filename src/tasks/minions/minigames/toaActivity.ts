import { sumArr } from 'e';

import { Emoji, Events } from '../../../lib/constants';
import { trackLoot } from '../../../lib/lootTrack';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { calcTOALoot } from '../../../lib/simulation/toa';
import { TOAOptions } from '../../../lib/types/minions';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { makeRepeatTripButton } from '../../../lib/util/globalInteractions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

const greenItems = resolveItems(['Twisted ancestral colour kit']);
const blueItems = resolveItems(['Metamorphic dust']);
const purpleButNotAnnounced = resolveItems(['Dexterous prayer scroll', 'Arcane prayer scroll']);

const purpleItems = [1];

interface RaidResultUser {
	points: number;
	mUser: MUser;
	deaths: number;
}

export const toaTask: MinionTask = {
	type: 'TombsOfAmascut',
	async run(data: TOAOptions) {
		const { channelID, users, raidLevel, duration, leader, quantity, wipedRoom } = data;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u[0])));
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
				undefined,
				[makeRepeatTripButton()]
			);
		}

		const totalLoot = new TeamLoot();

		const raidResults: Map<string, RaidResultUser> = new Map();
		for (const user of allUsers) {
			raidResults.set(user.id, {
				mUser: user,
				points: 0,
				deaths: 0
			});
		}

		for (let x = 0; x < quantity; x++) {
			const raidLoot = calcTOALoot({
				users: users.map(i => ({ id: i[0], points: i[1][x] })),
				raidLevel
			});
			for (const [id, points, deaths] of users) {
				const currentUser = raidResults.get(id)!;
				currentUser.points += points[x];
				currentUser.deaths += deaths[x].length;
				raidResults.set(id, currentUser);
			}
			for (const [userID, userLoot] of raidLoot.teamLoot.entries()) {
				totalLoot.add(userID, userLoot);
			}
		}
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

			const { itemsAdded } = await transactItems({
				userID,
				itemsToAdd: totalLoot.get(userID),
				collectionLog: true
			});

			const items = itemsAdded.items();

			const isPurple = items.some(([item]) => purpleItems.includes(item.id));
			const isGreen = items.some(([item]) => greenItems.includes(item.id));
			const isBlue = items.some(([item]) => blueItems.includes(item.id));
			const specialLoot = isPurple;
			const emote = isBlue ? Emoji.Blue : isGreen ? Emoji.Green : Emoji.Purple;
			if (items.some(([item]) => purpleItems.includes(item.id) && !purpleButNotAnnounced.includes(item.id))) {
				const itemsToAnnounce = itemsAdded.filter(item => purpleItems.includes(item.id), false);
				globalClient.emit(
					Events.ServerNotification,
					`${emote} ${user.badgedUsername} just received **${itemsToAnnounce}** on their ${formatOrdinal(
						await getMinigameScore(user.id, 'tombs_of_amascut')
					)} raid.`
				);
			}
			const str = specialLoot ? `${emote} ||${itemsAdded}||` : itemsAdded.toString();
			const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');

			resultMessage += `\n${deathStr} **${user}** received: ${str} (${points.toLocaleString()} pts, ${
				Emoji.Skull
			})`;
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

		handleTripFinish(allUsers[0], channelID, resultMessage, undefined, data, null);
	}
};
