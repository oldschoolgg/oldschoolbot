import { formatOrdinal } from '@oldschoolgg/toolkit';
import { randArrItem, reduceNumByPercent, roll, Time, uniqueArr } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { drawChestLootImage } from '../../../lib/bankImage';
import { Emoji, Events } from '../../../lib/constants';
import { doaCL, doaMetamorphPets } from '../../../lib/data/CollectionsExport';
import { globalDroprates } from '../../../lib/data/globalDroprates';
import { chanceOfDOAUnique, DOARooms, pickUniqueToGiveUser } from '../../../lib/depthsOfAtlantis';
import { trackLoot } from '../../../lib/lootTrack';
import { resolveAttackStyles } from '../../../lib/minions/functions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { DragonTable } from '../../../lib/simulation/grandmasterClue';
import { runeAlchablesTable, StoneSpiritTable } from '../../../lib/simulation/sharedTables';
import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { DOAOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

const DragonFletchingTable = new LootTable()
	.add('Dragon arrowtips', [10, 20])
	.add('Dragon dart tip', [10, 20])
	.add('Dragon javelin heads', [10, 20]);

const RareGemRockTable = new LootTable()
	.add('Uncut sapphire', 1, 9)
	.add('Uncut emerald', 1, 5)
	.add('Uncut ruby', 1, 5)
	.add('Uncut diamond', 1, 4);

const RareOreTable = new LootTable()
	.add('Mithril ore', [10, 70], 55)
	.add('Adamantite ore', [15, 50], 55)
	.add('Runite ore', [1, 20], 45)
	.add('Amethyst', [1, 15], 45);

const BaseNonUniqueTable = new LootTable()
	.add(RareGemRockTable, [80, 120], undefined, { multiply: true })
	.add(DragonFletchingTable, [15, 20], undefined, { multiply: true })
	.add(runeAlchablesTable, [25, 30], undefined, { multiply: true })
	.add(RareOreTable, [11, 15], undefined, { multiply: true })
	.add(DragonTable, [11, 18], undefined, { multiply: true })
	.add(StoneSpiritTable, [30, 60], undefined, { multiply: true });

const DOAClueTable = new LootTable()
	.add('Clue scroll (medium)', 1, 5)
	.add('Clue scroll (hard)', 1, 4)
	.add('Clue scroll (elite)', 1, 3)
	.add('Clue scroll (master)', 1, 2)
	.add('Clue scroll (grandmaster)', 1, 2);

export const DOANonUniqueTable = new LootTable()
	.tertiary(100, 'Oceanic dye')
	.oneIn(40, 'Shark tooth')
	.every(DOAClueTable, 2, { multiply: true })
	.every(BaseNonUniqueTable, 3, { multiply: true });

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
	results.push(
		user.addXP({ skillName: SkillsEnum.Ranged, amount: rangeXP, minimal: true, source: 'DepthsOfAtlantis' })
	);
	results.push(
		user.addXP({ skillName: SkillsEnum.Magic, amount: magicXP, minimal: true, source: 'DepthsOfAtlantis' })
	);
	let [, , styles] = resolveAttackStyles(user.getAttackStyles(), {
		monsterID: -1
	});
	if (([SkillsEnum.Magic, SkillsEnum.Ranged] as const).some(style => styles.includes(style))) {
		styles = [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
	}
	const perSkillMeleeXP = meleeXP / styles.length;
	for (const style of styles) {
		results.push(
			user.addXP({ skillName: style, amount: perSkillMeleeXP, minimal: true, source: 'DepthsOfAtlantis' })
		);
	}
	results.push(
		user.addXP({ skillName: SkillsEnum.Hitpoints, amount: meleeXP, minimal: true, source: 'DepthsOfAtlantis' })
	);

	return Promise.all(results);
}

interface RaidResultUser {
	mUser: MUser;
	deaths: number;
}

export const doaTask: MinionTask = {
	type: 'DepthsOfAtlantis',
	async run(data: DOAOptions) {
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
			allUsers.map(i =>
				userStatsUpdate(
					i.id,
					u => {
						const currentKCBank = new Bank(u.doa_room_attempts_bank as ItemBank);
						return {
							doa_room_attempts_bank: currentKCBank.add(newRoomAttempts).bank,
							doa_attempts: {
								increment: quantity
							}
						};
					},
					{}
				)
			)
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
				incrementMinigameScore(u.id, cm ? 'depths_of_atlantis_cm' : 'depths_of_atlantis', succesfulKCs)
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

				const { itemsAdded } = await transactItems({
					userID,
					itemsToAdd: totalLoot.get(userID),
					collectionLog: true
				});

				await userStatsUpdate(
					user.id,
					u => {
						return {
							doa_total_minutes_raided: {
								increment: Math.floor(duration / Time.Minute)
							},
							doa_loot: new Bank(u.doa_loot as ItemBank).add(totalLoot.get(userID)).bank
						};
					},
					{}
				);

				const items = itemsAdded.items();

				const isPurple = items.some(([item]) => doaCL.includes(item.id));
				const announcedItems = resolveItems(['Shark jaw', 'Oceanic relic', 'Aquifer aegis', 'Crush']);
				if (items.some(([item]) => announcedItems.includes(item.id))) {
					const itemsToAnnounce = itemsAdded.filter(item => doaCL.includes(item.id), false);
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

		await updateBankSetting('doa_loot', totalLoot.totalLoot());
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
