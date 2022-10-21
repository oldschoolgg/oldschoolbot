import { shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';

import { MysteryBoxes } from '../../../lib/bsoOpenables';
import { Emoji, Events } from '../../../lib/constants';
import { chambersOfXericCL, chambersOfXericMetamorphPets } from '../../../lib/data/CollectionsExport';
import { createTeam } from '../../../lib/data/cox';
import { userHasFlappy } from '../../../lib/invention/inventions';
import { trackLoot } from '../../../lib/lootTrack';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { RaidsOptions } from '../../../lib/types/minions';
import { clAdjustedDroprate, roll } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../mahoji/mahojiSettings';

interface RaidResultUser {
	personalPoints: number;
	loot: Bank;
	mUser: MUser;
	naturalDouble: boolean;
	flappyMsg: string | null;
	deaths: number;
	deathChance: number;
}
const orangeItems = resolveItems(['Takon', 'Steve']);
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
		const { channelID, users, challengeMode, duration, leader, quantity: _quantity } = data;
		const quantity = _quantity ?? 1;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u)));

		let totalPoints = 0;
		const raidResults = new Map<string, RaidResultUser>();
		const teamLoot = new TeamLoot([]);
		for (let x = 0; x < quantity; x++) {
			const team = await createTeam(allUsers, challengeMode);
			const raidLoot = ChambersOfXeric.complete({
				challengeMode,
				timeToComplete: duration,
				team
			});
			for (const [userID, userLoot] of Object.entries(raidLoot)) {
				let userData = raidResults.get(userID);
				// Do all the one-time / per-user stuff:
				if (!userData) {
					// User already fetched earlier, no need to make another DB call
					const mUser = allUsers.find(u => u.id === userID)!;

					// Set the double flags, so we don't charge for flappy repeatedly / give multiple boxes
					let naturalDouble = false;
					let flappyMsg: string | null = null;
					if (roll(10)) {
						naturalDouble = true;
					} else {
						const flappyRes = await userHasFlappy({ user: mUser, duration });
						if (flappyRes.shouldGiveBoost) {
							flappyMsg = flappyRes.userMsg;
						}
					}
					userData = {
						personalPoints: 0,
						loot: new Bank(),
						mUser,
						naturalDouble,
						flappyMsg,
						deaths: 0,
						deathChance: 0
					};
				}
				// Handle the per-raid stuff
				const member = team.find(m => m.id === userID)!;
				userData.personalPoints += member.personalPoints;
				userData.deaths += member.deaths;
				userData.deathChance = member.deathChance;
				totalPoints += member.personalPoints;
				// Double loot now, so we don't double Steve / Takon / etc
				if (userData.naturalDouble || userData.flappyMsg) userLoot.multiply(2);

				if (challengeMode && roll(50) && userData.mUser.cl.has('Metamorphic dust')) {
					const { bank } = userData.mUser.allItemsOwned();
					const unownedPet = shuffleArr(chambersOfXericMetamorphPets).find(pet => !bank[pet]);
					if (unownedPet) {
						userLoot.add(unownedPet);
						// Add pet to the mUser, this doesn't add to actual bank, just prevents duplicates
						userData.mUser.bank.add(unownedPet);
					}
				}
				if (userLoot.has('Ancient tablet')) {
					userLoot.bank[itemID('Ancient tablet')] = 1;
					// Add tablet to mUser, this doesn't add to user's bank, just prevents duplicates which would deny real loot rolls.
					userData.mUser.bank.add('Ancient tablet');
				}
				handleSpecialCoxLoot(userData.mUser, userLoot);
				userData.loot.add(userLoot);
				teamLoot.add(userID, userLoot);
				raidResults.set(userID, userData);
			}
		}

		const minigameID = challengeMode ? 'raids_challenge_mode' : 'raids';

		const totalLoot = new Bank();

		let resultMessage = `<@${leader}> Your ${challengeMode ? 'Challenge Mode Raid' : 'Raid'}${
			quantity > 1 ? 's have' : ' has'
		} finished. The total amount of points your team got is ${totalPoints.toLocaleString()}.\n`;
		await Promise.all(allUsers.map(u => incrementMinigameScore(u.id, minigameID, quantity)));

		for (let [userID, userData] of raidResults) {
			const { personalPoints, deaths, deathChance, naturalDouble, flappyMsg, loot, mUser: user } = userData;
			if (!user) continue;
			if (naturalDouble) loot.add(MysteryBoxes.roll());

			await user.update({
				total_cox_points: {
					increment: personalPoints
				}
			});

			const { itemsAdded } = await transactItems({
				userID,
				itemsToAdd: loot,
				collectionLog: true
			});
			totalLoot.add(itemsAdded);

			const items = itemsAdded.items();

			const isPurple = items.some(([item]) => purpleItems.includes(item.id));
			const isGreen = items.some(([item]) => greenItems.includes(item.id));
			const isBlue = items.some(([item]) => blueItems.includes(item.id));
			const isOrange = items.some(([item]) => orangeItems.includes(item.id));
			const specialLoot = isPurple || isGreen || isBlue || isOrange;
			const emote = isOrange ? Emoji.Orange : isBlue ? Emoji.Blue : isGreen ? Emoji.Green : Emoji.Purple;
			if (items.some(([item]) => purpleItems.includes(item.id) && !purpleButNotAnnounced.includes(item.id))) {
				const itemsToAnnounce = itemsAdded.filter(item => purpleItems.includes(item.id), false);
				globalClient.emit(
					Events.ServerNotification,
					`${emote} ${user.usernameOrMention} just received **${itemsToAnnounce}** on their ${formatOrdinal(
						await getMinigameScore(user.id, minigameID)
					)} raid.`
				);
			}
			const str = specialLoot ? `${emote} ||${itemsAdded}||` : itemsAdded.toString();
			const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');

			resultMessage += `\n${deathStr} **${user}** received: ${str} (${personalPoints?.toLocaleString()} pts, ${
				Emoji.Skull
			}${deathChance.toFixed(0)}%) `;
			if (flappyMsg) resultMessage += users.length === 1 ? `\n${flappyMsg}` : Emoji.Flappy;
		}

		updateBankSetting('cox_loot', totalLoot);
		await trackLoot({
			totalLoot,
			id: minigameID,
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: 1,
			users: allUsers.map(i => ({
				id: i.id,
				duration,
				loot: teamLoot.get(i.id)
			}))
		});

		handleTripFinish(allUsers[0], channelID, resultMessage, undefined, data, null);
	}
};
