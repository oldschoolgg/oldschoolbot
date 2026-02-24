import { CHINCANNON_MESSAGES } from '@/lib/bso/bsoConstants.js';

import { randArrItem, roll, shuffleArr } from '@oldschoolgg/rng';
import { Emoji, miniID } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { drawChestLootImage } from '@/lib/canvas/chestImage.js';
import { tobMetamorphPets } from '@/lib/data/CollectionsExport.js';
import { TOBRooms, TOBUniques } from '@/lib/data/tob.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { resolveAttackStyles } from '@/lib/minions/functions/resolveAttackStyles.js';
import { TeamLoot } from '@/lib/simulation/TeamLoot.js';
import { TheatreOfBlood } from '@/lib/simulation/tob.js';
import { XPCounter } from '@/lib/structures/XPCounter.js';
import type { TheatreOfBloodTaskOptions } from '@/lib/types/minions.js';

function handleTobXP(user: MUser, isHm: boolean, xpCounter: XPCounter): void {
	let hitpointsXP = 13_000;
	let rangeXP = 1000;
	let magicXP = 1000;
	let meleeXP = 36_000;

	if (isHm) {
		hitpointsXP *= 1.2;
		rangeXP *= 1.2;
		magicXP *= 1.2;
		meleeXP *= 1.2;
	}

	xpCounter.add('hitpoints', hitpointsXP);
	xpCounter.add('ranged', rangeXP);
	xpCounter.add('magic', magicXP);
	let styles = resolveAttackStyles({
		attackStyles: user.getAttackStyles()
	});
	if ((['magic', 'ranged'] as const).some(style => styles.includes(style))) {
		styles = ['attack', 'strength', 'defence'];
	}
	const perSkillMeleeXP = meleeXP / styles.length;
	for (const style of styles) {
		xpCounter.add(style, perSkillMeleeXP);
	}
}

export const tobTask: MinionTask = {
	type: 'TheatreOfBlood',
	async run(data: TheatreOfBloodTaskOptions, { handleTripFinish }) {
		const {
			channelId,
			users,
			hardMode,
			leader,
			wipedRooms,
			duration,
			deaths: allDeaths,
			quantity,
			cc: chincannonUser
		} = data;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u)));
		const uniqueUsersMap = new Map<string, MUser>();
		for (const user of allUsers) {
			uniqueUsersMap.set(user.id, user);
		}
		const uniqueUsers = [...uniqueUsersMap.values()];
		const minigameID = hardMode ? 'tob_hard' : 'tob';
		const allTag = uniqueUsers.map(u => u.toString()).join('');
		const teamsLoot = new TeamLoot([]);
		const globalTobCost = new Bank();
		const totalLoot = new Bank();
		const previousCLs = uniqueUsers.map(i => i.cl.clone());
		const isSolo = uniqueUsers.length === 1;
		let raidId = 0;
		let wipeCount = 0;
		let earnedAttempts = 0;
		let resultMessage = `**${allTag} Your ${hardMode ? 'Hard Mode ' : ''}Theatre of Blood has finished**\n`;

		const totalXPCounts: Record<string, XPCounter> = {};
		for (const user of uniqueUsers) {
			totalXPCounts[user.id] = new XPCounter();
		}

		for (let i = 0; i < quantity; i++) {
			raidId = i + 1;
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

			resultMessage += `\n **Raid${quantity < 2 ? '' : ` ${raidId}`} results (Unique chance: ${result.percentChanceOfUnique
				.toFixed(2)
				.replace('.00', '')}%):**`;

			// Give them all +1 attempts
			const diedToMaiden = wipedRoom !== null && wipedRoom === 0;
			if (!diedToMaiden) earnedAttempts++;

			// 100k tax if they wipe
			if (wipedRoom !== null) {
				wipeCount++;
				resultMessage += `\n Your team wiped in the Theatre of Blood, in the ${TOBRooms[wipedRoom].name} room!${
					diedToMaiden ? ' The team died very early, and nobody learnt much from this raid.' : ''
				}`;
				// They each paid 100k tax, it doesn't get refunded, so track it in economy stats.
				globalTobCost.add('Coins', users.length * 100_000);
				continue;
			}

			// Track loot for T3+ patrons
			if (!chincannonUser) {
				await Promise.all(
					uniqueUsers.map(user => {
						return user.statsBankUpdate('tob_loot', new Bank(result.loot[user.id]));
					})
				);
			}

			for (const [userID, _userLoot] of Object.entries(result.loot)) {
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

				// Add XP
				handleTobXP(user, hardMode, totalXPCounts[user.id]);

				const items = userLoot.items();

				const isPurple = items.some(([item]) => TOBUniques.includes(item.id));
				const deathStr =
					userDeaths.length === 0 ? '' : `${Emoji.Skull}(${userDeaths.map(i => TOBRooms[i].name)})`;

				const lootStr = userLoot.remove('Coins', 100_000).toString();
				const str = isPurple ? `${Emoji.Purple} ||${lootStr.padEnd(30, ' ')}||` : `${lootStr}`;

				const receivedPrefix = isSolo
					? ''
					: `**${user}** ${chincannonUser ? 'had this loot blown up' : 'received'}: `;
				resultMessage += `\n ${deathStr}${receivedPrefix}${str}`;

				if (raidId < quantity) {
					resultMessage += '\n';
				}
			}
		}

		// Give everyone their XP:
		const xpString = (
			await Promise.all(
				uniqueUsers.map(async u => {
					const theirXP = totalXPCounts[u.id];
					if (theirXP.length === 0) return null;
					await u.addXPCounter({ xpCounter: theirXP, source: 'TheatreOfBlood', minimal: true });
					return `${u.mention} received ${theirXP} XP`;
				})
			)
		).filter(i => i !== null);
		if (xpString.length > 0) {
			resultMessage += `\n\n${xpString.join('\n')}`;
		}

		// Give everyone their loot:
		if (chincannonUser) {
			await Promise.all(
				uniqueUsers.map(u => u.statsBankUpdate('chincannon_destroyed_loot_bank', teamsLoot.get(u.id)))
			);
		} else {
			await Promise.all(
				uniqueUsers.map(u => u.addItemsToBank({ items: teamsLoot.get(u.id), collectionLog: true }))
			);
		}

		// Give them their earned attempts:
		if (earnedAttempts > 0) {
			await Promise.all(
				uniqueUsers.map(u => {
					const key = hardMode ? 'tob_hard_attempts' : 'tob_attempts';
					return u.statsUpdate({
						[key]: {
							increment: earnedAttempts
						}
					});
				})
			);
		}
		const successfulRaidCount = quantity - wipeCount;
		if (successfulRaidCount > 0) {
			await Promise.all(uniqueUsers.map(u => u.incrementMinigameScore(minigameID, successfulRaidCount)));
		}
		if (wipeCount > 0) {
			await ClientSettings.updateBankSetting('tob_cost', globalTobCost);
		}

		const effectiveTotalLoot = chincannonUser ? new Bank() : totalLoot;
		await ClientSettings.updateBankSetting('tob_loot', effectiveTotalLoot);
		await trackLoot({
			totalLoot: effectiveTotalLoot,
			id: minigameID,
			type: 'Minigame',
			changeType: 'loot',
			duration,
			kc: successfulRaidCount,
			users: uniqueUsers.map(i => ({
				id: i.id,
				loot: teamsLoot.get(i.id),
				duration
			}))
		});

		if (chincannonUser) {
			const msg = randArrItem(CHINCANNON_MESSAGES);
			resultMessage += `\n\n**${msg}**`;
		}
		const shouldShowImage =
			uniqueUsers.length <= 3 && teamsLoot.entries().every(i => i[1].length <= 6 && i[1].length > 0);

		if (isSolo) {
			const image = shouldShowImage
				? await drawChestLootImage({
						entries: [
							{
								loot: totalLoot.remove('Coins', raidId * 100_000),
								user: uniqueUsers[0],
								previousCL: previousCLs[0],
								customTexts: []
							}
						],
						type: 'Theatre of Blood'
					})
				: undefined;
			return handleTripFinish({
				user: uniqueUsers[0],
				channelId,
				message: { content: resultMessage, files: [image] },
				data,
				loot: totalLoot
			});
		}

		const image = shouldShowImage
			? await drawChestLootImage({
					entries: uniqueUsers.map((u, index) => ({
						loot: teamsLoot.get(u.id).remove('Coins', raidId * 100_000),
						user: u,
						previousCL: previousCLs[index],
						customTexts: []
					})),
					type: 'Theatre of Blood'
				})
			: undefined;

		return handleTripFinish({
			user: uniqueUsers[0],
			channelId,
			message: { content: resultMessage, files: [image] },
			data,
			loot: totalLoot
		});
	}
};
