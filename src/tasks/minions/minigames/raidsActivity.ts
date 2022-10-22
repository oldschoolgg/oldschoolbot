import { noOp, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';

import { MysteryBoxes } from '../../../lib/bsoOpenables';
import { Emoji, Events } from '../../../lib/constants';
import { chambersOfXericCL, chambersOfXericMetamorphPets } from '../../../lib/data/CollectionsExport';
import { createTeam } from '../../../lib/data/cox';
import { userHasFlappy } from '../../../lib/invention/inventions';
import { trackLoot } from '../../../lib/settings/prisma';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { RaidsOptions } from '../../../lib/types/minions';
import { clAdjustedDroprate, roll } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../mahoji/mahojiSettings';

const notPurple = resolveItems(['Torn prayer scroll', 'Dark relic', 'Onyx']);
const greenItems = resolveItems(['Twisted ancestral colour kit']);
const blueItems = resolveItems(['Metamorphic dust']);
const purpleButNotAnnounced = resolveItems(['Dexterous prayer scroll', 'Arcane prayer scroll']);

const purpleItems = chambersOfXericCL.filter(i => !notPurple.includes(i));

// user is null if tame is killing
export function handleSpecialCoxLoot(user: MUser | null, loot: Bank) {
	const takonDropRate = user ? clAdjustedDroprate(user, 'Takon', 600, 2) : 4500;
	if (roll(takonDropRate)) {
		loot.add('Takon');
	}
	const steveDropRate = user ? clAdjustedDroprate(user, 'Steve', 300, 2) : 500;
	if (roll(steveDropRate)) {
		loot.add('Steve');
	}
	if (roll(140)) {
		loot.add('Clue scroll (grandmaster)');
	}
}

export const raidsTask: MinionTask = {
	type: 'Raids',
	async run(data: RaidsOptions) {
		const { channelID, users, challengeMode, duration, leader } = data;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u)));
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

		const minigameID = challengeMode ? 'raids_challenge_mode' : 'raids';

		const totalLoot = new Bank();

		let resultMessage = `<@${leader}> Your ${
			challengeMode ? 'Challenge Mode Raid' : 'Raid'
		} has finished. The total amount of points your team got is ${totalPoints.toLocaleString()}.\n`;
		await Promise.all(allUsers.map(u => incrementMinigameScore(u.id, minigameID, 1)));

		for (let [userID, _userLoot] of Object.entries(loot)) {
			const user = await mUserFetch(userID).catch(noOp);
			if (!user) continue;
			const { personalPoints, deaths, deathChance } = team.find(u => u.id === user.id)!;

			await user.update({
				total_cox_points: {
					increment: personalPoints
				}
			});

			let flappyMsg: string | null = null;
			const userLoot = new Bank(_userLoot);
			if (roll(10)) {
				userLoot.multiply(2);
				userLoot.add(MysteryBoxes.roll());
			} else {
				const flappyRes = await userHasFlappy({ user, duration });
				if (flappyRes.shouldGiveBoost) {
					userLoot.multiply(2);
					flappyMsg = flappyRes.userMsg;
				}
			}
			if (challengeMode && roll(50) && user.cl.has('Metamorphic dust')) {
				const { bank } = user.allItemsOwned();
				const unownedPet = shuffleArr(chambersOfXericMetamorphPets).find(pet => !bank[pet]);
				if (unownedPet) {
					userLoot.add(unownedPet);
				}
			}
			handleSpecialCoxLoot(user, userLoot);

			const { itemsAdded } = await transactItems({ userID: user.id, itemsToAdd: userLoot, collectionLog: true });
			totalLoot.add(itemsAdded);

			const items = itemsAdded.items();

			const isPurple = items.some(([item]) => purpleItems.includes(item.id));
			const isGreen = items.some(([item]) => greenItems.includes(item.id));
			const isBlue = items.some(([item]) => blueItems.includes(item.id));
			const emote = isBlue ? Emoji.Blue : isGreen ? Emoji.Green : Emoji.Purple;
			if (items.some(([item]) => purpleItems.includes(item.id) && !purpleButNotAnnounced.includes(item.id))) {
				const itemsToAnnounce = itemsAdded.filter(item => purpleItems.includes(item.id), false);
				globalClient.emit(
					Events.ServerNotification,
					`${emote} ${user.usernameOrMention} just received **${itemsToAnnounce}** on their ${formatOrdinal(
						await getMinigameScore(user.id, minigameID)
					)} raid.`
				);
			}
			const str = isPurple ? `${emote} ||${itemsAdded}||` : itemsAdded.toString();
			const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');

			resultMessage += `\n${deathStr} **${user}** received: ${str} (${personalPoints?.toLocaleString()} pts, ${
				Emoji.Skull
			}${deathChance.toFixed(0)}%)`;
			if (flappyMsg) resultMessage += flappyMsg;
		}

		updateBankSetting('cox_loot', totalLoot);
		await trackLoot({
			loot: totalLoot,
			id: minigameID,
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: 1,
			teamSize: users.length
		});

		handleTripFinish(allUsers[0], channelID, resultMessage, undefined, data, null);
	}
};
