import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import { shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc/ChambersOfXeric';

import { drawChestLootImage } from '../../../lib/bankImage';
import { Emoji, Events } from '../../../lib/constants';
import { chambersOfXericCL, chambersOfXericMetamorphPets } from '../../../lib/data/CollectionsExport';
import { coxCMUniques, coxUniques, createTeam } from '../../../lib/data/cox';
import { trackLoot } from '../../../lib/lootTrack';
import { resolveAttackStyles } from '../../../lib/minions/functions';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import type { RaidsOptions } from '../../../lib/types/minions';
import { randomVariation, resolveItems, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

interface RaidResultUser {
	personalPoints: number;
	loot: Bank;
	mUser: MUser;
	deaths: number;
	deathChance: number;
	gotAncientTablet?: boolean;
}

const notPurple = resolveItems(['Torn prayer scroll', 'Dark relic', 'Onyx']);
const greenItems = resolveItems(['Twisted ancestral colour kit']);
const blueItems = resolveItems(['Metamorphic dust']);
const purpleButNotAnnounced = resolveItems(['Dexterous prayer scroll', 'Arcane prayer scroll']);

const coxPurpleItems = chambersOfXericCL.filter(i => !notPurple.includes(i));

async function handleCoxXP(user: MUser, qty: number, isCm: boolean) {
	let hitpointsXP = 12_000 * qty;
	let rangeXP = 10_000 * qty;
	let magicXP = 1500 * qty;
	let meleeXP = 8000 * qty;

	if (isCm) {
		hitpointsXP *= 1.5;
		rangeXP *= 1.5;
		magicXP *= 1.5;
		meleeXP *= 1.5;
	}

	const results = [];
	results.push(
		await user.addXP({
			skillName: SkillsEnum.Hitpoints,
			amount: hitpointsXP,
			minimal: true,
			source: 'ChambersOfXeric'
		})
	);
	results.push(
		await user.addXP({ skillName: SkillsEnum.Ranged, amount: rangeXP, minimal: true, source: 'ChambersOfXeric' })
	);
	results.push(
		await user.addXP({ skillName: SkillsEnum.Magic, amount: magicXP, minimal: true, source: 'ChambersOfXeric' })
	);
	let styles = resolveAttackStyles({
		attackStyles: user.getAttackStyles()
	});
	if (([SkillsEnum.Magic, SkillsEnum.Ranged] as const).some(style => styles.includes(style))) {
		styles = [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
	}
	const perSkillMeleeXP = meleeXP / styles.length;
	for (const style of styles) {
		results.push(
			await user.addXP({ skillName: style, amount: perSkillMeleeXP, minimal: true, source: 'ChambersOfXeric' })
		);
	}
	return results;
}

export const raidsTask: MinionTask = {
	type: 'Raids',
	async run(data: RaidsOptions) {
		const {
			channelID,
			users,
			challengeMode,
			isFakeMass,
			maxSizeInput,
			duration,
			leader,
			quantity: _quantity
		} = data;
		const quantity = _quantity ?? 1;
		const fetchedUsers = await Promise.all(users.map(async u => mUserFetch(u)));
		let allUsers = isFakeMass ? Array(maxSizeInput).fill(fetchedUsers[0]) : fetchedUsers;
		const previousCLs = allUsers.map(i => i.cl.clone());

		let totalPoints = 0;
		const fakeUserResults = new Map<string, Bank>();
		const raidResults = new Map<string, RaidResultUser>();
		for (let x = 0; x < quantity; x++) {
			const team = await createTeam(allUsers, challengeMode);
			// Prevent getting multiple Ancient Tablets
			for (const teamMate of team) {
				if (raidResults.get(teamMate.id)?.gotAncientTablet) {
					teamMate.canReceiveAncientTablet = false;
				}
			}

			if (isFakeMass) {
				// Remove the users ID from fake users
				for (let i = 1; i < team.length; i++) {
					team[i].id = `${i}`;
				}
			}

			// Vary completion times for multiple raids in 1 trip
			const timeToComplete = quantity === 1 ? duration : randomVariation(duration / quantity, 2);
			const raidLoot = ChambersOfXeric.complete({
				challengeMode,
				timeToComplete,
				team
			});

			for (const [userID, userLoot] of Object.entries(raidLoot)) {
				//track the simulated users loot to show the user on trip return
				if (isFakeMass) {
					if (userID !== leader) {
						const existingLoot = fakeUserResults.get(userID) || new Bank();
						existingLoot.add(userLoot);
						fakeUserResults.set(userID, existingLoot);
					}
				}
				let userData = raidResults.get(userID);
				// Do all the one-time / per-user stuff:
				if (!userData) {
					// User already fetched earlier, no need to make another DB call
					const mUser = allUsers.find(u => u.id === userID)!;
					userData = {
						personalPoints: 0,
						loot: new Bank(),
						mUser,
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

				// logic for cox metamorph pets
				const addMetamorphPet = (userData: RaidResultUser, userLoot: Bank, challengeMode: boolean) => {
					const hasDust = userData.loot.has('Metamorphic dust') || userData.mUser.cl.has('Metamorphic dust');
					if (challengeMode && roll(50) && hasDust) {
						const result = userData.loot.clone().add(userData.mUser.allItemsOwned);
						const unownedPet = shuffleArr(chambersOfXericMetamorphPets).find(pet => !result.has(pet));
						if (unownedPet) {
							userLoot.add(unownedPet);
						}
					}
				};
				if (isFakeMass) {
					if (userID === leader) {
						addMetamorphPet(userData, userLoot, challengeMode);
					}
				} else {
					addMetamorphPet(userData, userLoot, challengeMode);
				}

				if (userLoot.has('Ancient tablet')) {
					userData.gotAncientTablet = true;
				}

				userData.loot.add(userLoot);
				raidResults.set(userID, userData);
			}
		}

		const minigameID = challengeMode ? 'raids_challenge_mode' : 'raids';

		const totalLoot = new Bank();
		let resultMessage = `<@${leader}> Your ${challengeMode ? 'Challenge Mode Raid' : 'Raid'}${
			quantity > 1 ? 's have' : ' has'
		} finished. The total amount of points your team got is ${totalPoints.toLocaleString()}.`;

		// create the simulated users loot message
		if (isFakeMass) {
			const fakeUsersStr: string[] = [];
			for (const [fakeID, fakeLoot] of fakeUserResults) {
				const greenUnique = coxCMUniques.find(u => fakeLoot.has(u));
				const purpleUnique = coxUniques.find(u => fakeLoot.has(u));
				const fakeUserOlmlet = fakeLoot.has('Olmlet');
				fakeUsersStr.push(
					`${fakeUserOlmlet ? '<:Olmlet:324127376873357316>' : ''}${greenUnique ? `${Emoji.Green}` : ''}${purpleUnique ? `${Emoji.Purple}` : ''}User #${fakeID}: ${fakeLoot}\n`
				);
			}
			const fakeUsersString = fakeUsersStr.join(' ');
			const greenUnique = coxCMUniques.find(u => fakeUsersString.includes(u));
			const purpleUnique = coxUniques.find(u => fakeUsersString.includes(u));
			const fakeUserOlmlet = fakeUsersString.includes('Olmlet');
			resultMessage += `\n${`\n${fakeUserOlmlet ? '<:Olmlet:324127376873357316>' : ''}${greenUnique ? `${Emoji.Green}` : ''}${purpleUnique ? `${Emoji.Purple}` : ''}Simulated users loot:\n||${fakeUsersStr.join('')}||`}`;
		}

		// Filter out fake users and only retain the leader's results
		if (isFakeMass) {
			allUsers = fetchedUsers;
			const leaderResult = raidResults.get(leader) as RaidResultUser;
			raidResults.clear();
			if (leaderResult) {
				raidResults.set(leader, leaderResult);
			}
		}

		await Promise.all(allUsers.map(u => incrementMinigameScore(u.id, minigameID, quantity)));

		for (const [userID, userData] of raidResults) {
			const { personalPoints, deaths, deathChance, loot, mUser: user } = userData;
			if (!user) continue;

			const [xpResult, { itemsAdded }] = await Promise.all([
				handleCoxXP(user, quantity, challengeMode),
				transactItems({
					userID,
					itemsToAdd: loot,
					collectionLog: true
				}),
				userStatsUpdate(
					user.id,
					{
						total_cox_points: {
							increment: personalPoints
						}
					},
					{}
				)
			]);

			totalLoot.add(itemsAdded);

			const items = itemsAdded.items();

			const isPurple = items.some(([item]) => coxPurpleItems.includes(item.id));
			const isGreen = items.some(([item]) => greenItems.includes(item.id));
			const isBlue = items.some(([item]) => blueItems.includes(item.id));
			const specialLoot = isPurple;
			const emote = isBlue ? Emoji.Blue : isGreen ? Emoji.Green : Emoji.Purple;
			if (items.some(([item]) => coxPurpleItems.includes(item.id) && !purpleButNotAnnounced.includes(item.id))) {
				const itemsToAnnounce = itemsAdded.filter(item => coxPurpleItems.includes(item.id));
				globalClient.emit(
					Events.ServerNotification,
					`${emote} ${user.badgedUsername} just received **${itemsToAnnounce}** on their ${formatOrdinal(
						await getMinigameScore(user.id, minigameID)
					)} raid.`
				);
			}
			const str = specialLoot ? `${emote} ||${itemsAdded}||` : itemsAdded.toString();
			const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');

			resultMessage += `\n${deathStr}${user} received: ${str} (${personalPoints?.toLocaleString()} pts, ${
				Emoji.Skull
			}${deathChance.toFixed(0)}%) ${xpResult}`;
		}

		updateBankSetting('cox_loot', totalLoot);
		await trackLoot({
			totalLoot,
			id: minigameID,
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: quantity,
			users: allUsers.map(i => ({
				id: i.id,
				duration,
				loot: raidResults.get(i.id)?.loot ?? new Bank()
			}))
		});

		const shouldShowImage = allUsers.length <= 3 && Array.from(raidResults.values()).every(i => i.loot.length <= 6);

		if (users.length === 1) {
			return handleTripFinish(
				allUsers[0],
				channelID,
				resultMessage,
				shouldShowImage
					? await drawChestLootImage({
							entries: [
								{
									loot: totalLoot,
									user: allUsers[0],
									previousCL: previousCLs[0],
									customTexts: []
								}
							],
							type: 'Chambers of Xerician'
						})
					: undefined,
				data,
				totalLoot
			);
		}

		handleTripFinish(
			allUsers[0],
			channelID,
			resultMessage,
			shouldShowImage
				? await drawChestLootImage({
						entries: allUsers.map((u, index) => ({
							loot: raidResults.get(u.id)!.loot,
							user: u,
							previousCL: previousCLs[index],
							customTexts: []
						})),
						type: 'Chambers of Xerician'
					})
				: undefined,
			data,
			null
		);
	}
};
