import type { DOAOptions } from '@/lib/bso/bsoTypes.js';
import { doaCL, doaMetamorphPets } from '@/lib/bso/collection-log/main.js';
import { chanceOfDOAUnique, DOARooms, pickUniqueToGiveUser } from '@/lib/bso/depthsOfAtlantis.js';
import { DOANonUniqueTable } from '@/lib/bso/doa/doaLootTable.js';
import { globalDroprates } from '@/lib/bso/globalDroprates.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { Emoji, Events, formatOrdinal, reduceNumByPercent, Time, uniqueArr } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, resolveItems } from 'oldschooljs';

import { drawChestLootImage } from '@/lib/canvas/chestImage.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { resolveAttackStyles } from '@/lib/minions/functions/resolveAttackStyles.js';
import { TeamLoot } from '@/lib/simulation/TeamLoot.js';

async function handleDOAXP(user: MUser, qty: number, isCm: boolean) {
	let rangeXP = 10_000 * qty;
	let magicXP = 1500 * qty;
	let meleeXP = 8000 * qty;

	if (isCm) {
		rangeXP *= 1.5;
		magicXP *= 1.5;
		meleeXP *= 1.5;
	}

	const results = [];
	results.push(user.addXP({ skillName: 'ranged', amount: rangeXP, minimal: true, source: 'DepthsOfAtlantis' }));
	results.push(user.addXP({ skillName: 'magic', amount: magicXP, minimal: true, source: 'DepthsOfAtlantis' }));
	let styles = resolveAttackStyles({
		attackStyles: user.getAttackStyles()
	});
	if ((['magic', 'ranged'] as const).some(style => styles.includes(style))) {
		styles = ['attack', 'strength', 'defence'];
	}
	const perSkillMeleeXP = meleeXP / styles.length;
	for (const style of styles) {
		results.push(
			user.addXP({ skillName: style, amount: perSkillMeleeXP, minimal: true, source: 'DepthsOfAtlantis' })
		);
	}
	results.push(user.addXP({ skillName: 'hitpoints', amount: meleeXP, minimal: true, source: 'DepthsOfAtlantis' }));

	return Promise.all(results);
}

interface RaidResultUser {
	mUser: MUser;
	deaths: number;
}

export const doaTask: MinionTask = {
	type: 'DepthsOfAtlantis',
	async run(data: DOAOptions, { handleTripFinish }) {
		const { channelID, cm, duration, leader, quantity, users, raids } = data;
		const isSolo = users.length === 1;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u)));
		const leaderSoloUser = allUsers[0];

		const previousCLs = allUsers.map(i => i.cl.clone());

		const newRoomAttempts = new Bank();
		for (const raid of raids) {
			for (const room of DOARooms) {
				if (!raid.wipedRoom || room.id <= raid.wipedRoom) {
					newRoomAttempts.add(room.id);
				}
			}
		}
		// Increment all users attempts
		await Promise.all(
			allUsers.map(async u => {
				const stats = await u.fetchStats();
				const currentKCBank = new Bank(stats.doa_room_attempts_bank as ItemBank);
				u.statsUpdate({
					doa_room_attempts_bank: currentKCBank.add(newRoomAttempts).toJSON(),
					doa_attempts: {
						increment: quantity
					}
				});
			})
		);

		if (raids.every(i => i.wipedRoom !== null)) {
			return handleTripFinish(
				allUsers[0],
				channelID,
				`${allUsers.map(i => i.toString()).join(' ')} Your team wiped in the Depths of Atlantis!`,
				undefined,
				data,
				null,
				undefined
			);
		}

		const totalLoot = new TeamLoot(doaCL);

		const raidResults: Map<string, RaidResultUser> = new Map();
		for (const user of allUsers) {
			raidResults.set(user.id, {
				mUser: user,
				deaths: 0
			});
		}

		let petDroprate = globalDroprates.doaCrush.baseRate;
		if (cm) petDroprate = reduceNumByPercent(petDroprate, globalDroprates.doaCrush.cmReduction);

		let messages: string[] = [];
		const uniqueChance = chanceOfDOAUnique(users.length, cm);
		messages.push(`Your team has a 1 in ${uniqueChance} unique chance per raid.`);

		for (const raid of raids) {
			if (raid.wipedRoom) {
				messages.push('  Your team wiped in this raid, no loot will be given to anyone.');
				continue;
			}
			const uniqueRecipient = roll(uniqueChance) ? randArrItem(allUsers) : undefined;
			for (let i = 0; i < raid.users.length; i++) {
				const user = allUsers[i];

				if (raid.users[i].deaths.length >= 2) {
					messages.push(
						`  ${user.rawUsername} died more than twice, and will not receive any loot in this raid.`
					);
					continue;
				}
				if (uniqueRecipient && user.id === uniqueRecipient.id) {
					totalLoot.add(uniqueRecipient.id, pickUniqueToGiveUser(user.cl));
				} else {
					totalLoot.add(user.id, DOANonUniqueTable.roll());
				}

				if (cm && roll(globalDroprates.doaMetamorphPet.baseRate)) {
					const unownedCMPets = randArrItem(doaMetamorphPets.filter(t => !user.cl.has(t)));
					if (unownedCMPets) {
						totalLoot.add(user.id, unownedCMPets);
					}
				}

				if (roll(petDroprate)) {
					totalLoot.add(user.id, 'Crush');
				}
			}
		}
		messages = uniqueArr(messages);

		const succesfulKCs = raids.filter(i => !i.wipedRoom).length;
		const minigameIncrementResult = await Promise.all(
			allUsers.map(u =>
				u.incrementMinigameScore(cm ? 'depths_of_atlantis_cm' : 'depths_of_atlantis', succesfulKCs)
			)
		);

		let resultMessage = isSolo
			? `${leaderSoloUser}, your minion finished ${quantity === 1 ? 'a' : `${quantity}x`}${
					cm ? ' Challenge Mode' : ''
				} Depths of Atlantis raid${quantity > 1 ? 's' : ''}! Your KC is now ${
					minigameIncrementResult[0].newScore
				}.\n`
			: `<@${leader}> Your${cm ? ' Challenge Mode' : ''} Depths of Atlantis Raid${
					quantity > 1 ? 's have' : ' has'
				} finished.\n`;

		const shouldShowImage = allUsers.length <= 3 && totalLoot.entries().every(i => i[1].length <= 6);

		await Promise.all(
			Array.from(raidResults.entries()).map(async ([userID, userData]) => {
				const { deaths, mUser: user } = userData;

				const { itemsAdded } = await user.transactItems({
					itemsToAdd: totalLoot.get(userID),
					collectionLog: true
				});

				const stats = await user.fetchStats();
				await user.statsUpdate({
					doa_total_minutes_raided: {
						increment: Math.floor(duration / Time.Minute)
					},
					doa_loot: new Bank(stats.doa_loot as ItemBank).add(totalLoot.get(userID)).toJSON()
				});

				const items = itemsAdded.items();

				const isPurple = items.some(([item]) => doaCL.includes(item.id));
				const announcedItems = resolveItems(['Shark jaw', 'Oceanic relic', 'Aquifer aegis', 'Crush']);
				if (items.some(([item]) => announcedItems.includes(item.id))) {
					const itemsToAnnounce = itemsAdded.filter(item => doaCL.includes(item.id));
					globalClient.emit(
						Events.ServerNotification,
						`${Emoji.Purple} ${
							user.badgedUsername
						} just received **${itemsToAnnounce}** on their ${formatOrdinal(
							minigameIncrementResult[0].newScore
						)} raid.`
					);
				}
				const str = isPurple ? `${Emoji.Purple} ||${itemsAdded}||` : itemsAdded.toString();
				const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');

				let usersResult = '';
				if (shouldShowImage) {
					usersResult += `\n${deathStr} **${user}**`;
				} else {
					usersResult += `\n${deathStr} **${user}** received: ${str}`;
				}

				const xpStrings = await handleDOAXP(user, quantity, cm);
				usersResult += ` ${xpStrings.join(', ')}`;
				resultMessage += usersResult;
			})
		);

		if (messages.length > 0) {
			resultMessage += `\n\n${messages.join('\n')}`;
		}

		await ClientSettings.updateBankSetting('doa_loot', totalLoot.totalLoot());
		await trackLoot({
			totalLoot: totalLoot.totalLoot(),
			id: 'depths_of_atlantis',
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

		if (isSolo) {
			return handleTripFinish(
				allUsers[0],
				channelID,
				resultMessage,
				shouldShowImage
					? await drawChestLootImage({
							entries: [
								{
									loot: totalLoot.totalLoot(),
									user: allUsers[0],
									previousCL: previousCLs[0],
									customTexts: []
								}
							],
							type: 'Depths of Atlantis'
						})
					: undefined,
				data,
				null
			);
		}

		return handleTripFinish(
			allUsers[0],
			channelID,
			resultMessage,
			shouldShowImage
				? await drawChestLootImage({
						entries: allUsers.map((u, index) => ({
							loot: totalLoot.get(u.id),
							user: u,
							previousCL: previousCLs[index],
							customTexts: []
						})),
						type: 'Depths of Atlantis'
					})
				: undefined,
			data,
			null
		);
	}
};
