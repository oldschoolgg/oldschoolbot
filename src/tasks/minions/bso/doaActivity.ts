import { formatOrdinal } from '@oldschoolgg/toolkit';
import { randArrItem, roll, Time, uniqueArr } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { drawChestLootImage } from '../../../lib/bankImage';
import { Emoji, Events, toaPurpleItems } from '../../../lib/constants';
import { toaCL } from '../../../lib/data/CollectionsExport';
import { chanceOfDOAUnique, DOARooms, pickUniqueToGiveUser } from '../../../lib/depthsOfAtlantis';
import { trackLoot } from '../../../lib/lootTrack';
import { resolveAttackStyles } from '../../../lib/minions/functions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ClueTable, GrimyHerbTable, runeAlchablesTable, StoneSpiritTable } from '../../../lib/simulation/sharedTables';
import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { GemRockTable } from '../../../lib/skilling/skills/mining';
import { DOAOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

const DragonTable = new LootTable()
	.add('Dragon arrowtips', [10, 20])
	.add('Dragon dart tip', [10, 20])
	.add('Dragon javelin heads', [10, 20]);

const BaseNonUniqueTable = new LootTable()
	.add(GemRockTable, [10, 20])
	.add(DragonTable, [3, 5])
	.add(runeAlchablesTable, [10, 15])
	.add(GrimyHerbTable, [4, 10])
	.add(StoneSpiritTable, [4, 10]);

export const DOANonUniqueTable = new LootTable()
	.tertiary(500, 'Crush')
	.tertiary(100, 'Oceanic dye')
	.oneIn(70, 'Shark tooth')
	.tertiary(5, ClueTable)
	.every(BaseNonUniqueTable, 3);

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
		await user.addXP({ skillName: SkillsEnum.Ranged, amount: rangeXP, minimal: true, source: 'ChambersOfXeric' })
	);
	results.push(
		await user.addXP({ skillName: SkillsEnum.Magic, amount: magicXP, minimal: true, source: 'ChambersOfXeric' })
	);
	let [, , styles] = resolveAttackStyles(user, {
		monsterID: -1
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

interface RaidResultUser {
	mUser: MUser;
	deaths: number;
	// kc: number;
}

export const doaTask: MinionTask = {
	type: 'DepthsOfAtlantis',
	async run(data: DOAOptions) {
		const { channelID, cm, duration, leader, quantity, users, raids } = data;
		const isSolo = users.length === 1;
		const allUsers = await Promise.all(users.map(async u => mUserFetch(u)));
		const leaderSoloUser = allUsers[0];

		const previousCLs = allUsers.map(i => i.cl.clone());

		// Increment all users attempts
		await Promise.all(
			allUsers.map(i =>
				userStatsUpdate(
					i.id,
					{
						toa_attempts: {
							increment: quantity
						}
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

		const totalLoot = new TeamLoot(toaCL);

		const raidResults: Map<string, RaidResultUser> = new Map();
		for (const user of allUsers) {
			raidResults.set(user.id, {
				mUser: user,
				deaths: 0
			});
		}

		let messages: string[] = [];
		const uniqueChance = chanceOfDOAUnique(users.length, cm);
		messages.push(`Your team has a 1 in ${uniqueChance} unique chance per raid.`);

		const teamLoot = new TeamLoot();

		for (const raid of raids) {
			if (raid.wipedRoom) continue;
			const uniqueRecipient = roll(uniqueChance) ? randArrItem(allUsers) : undefined;
			for (let i = 0; i < raid.users.length; i++) {
				if (raid.users[i].deaths.length >= 2) continue;
				const user = allUsers[i];
				if (uniqueRecipient && user.id === uniqueRecipient.id) {
					teamLoot.add(uniqueRecipient.id, pickUniqueToGiveUser(user.cl));
				} else {
					teamLoot.add(user.id, DOANonUniqueTable.roll());
				}
			}
		}
		messages = uniqueArr(messages);
		const minigameIncrementResult = await Promise.all(
			allUsers.map(u =>
				incrementMinigameScore(u.id, cm ? 'depths_of_atlantis_cm' : 'depths_of_atlantis', quantity)
			)
		);

		let resultMessage = isSolo
			? `${leaderSoloUser}, your minion finished ${quantity === 1 ? 'a' : `${quantity}x`}${
					cm ? 'Challenge Mode' : ''
			  } Depths of Atlantis raid${quantity > 1 ? 's' : ''}! Your KC is now ${
					minigameIncrementResult[0].newScore
			  }.\n`
			: `<@${leader}> Your Depths of Atlantis Raid${quantity > 1 ? 's have' : ' has'} finished.\n`;

		const shouldShowImage = allUsers.length <= 3 && totalLoot.entries().every(i => i[1].length <= 6);

		await Promise.all(
			Array.from(raidResults.entries()).map(async ([userID, userData]) => {
				const { deaths, mUser: user } = userData;

				const { itemsAdded } = await transactItems({
					userID,
					itemsToAdd: totalLoot.get(userID),
					collectionLog: true
				});

				const newRoomAttempts = new Bank();
				for (const raid of raids) {
					for (const room of DOARooms) {
						if (!raid.wipedRoom || room.id < raid.wipedRoom) [newRoomAttempts.add(room.id)];
					}
				}

				await userStatsUpdate(
					user.id,
					u => {
						const currentKCBank = new Bank(u.doa_room_attempts_bank as ItemBank);
						return {
							doa_total_minutes_raided: {
								increment: Math.floor(duration / Time.Minute)
							},
							doa_loot: new Bank(u.doa_loot as ItemBank).add(totalLoot.get(userID)).bank,
							doa_attempts: quantity,
							doa_room_attempts_bank: currentKCBank.add(newRoomAttempts).bank
						};
					},
					{}
				);

				const items = itemsAdded.items();

				const isPurple = items.some(([item]) => toaPurpleItems.includes(item.id));
				if (items.some(([item]) => toaPurpleItems.includes(item.id))) {
					const itemsToAnnounce = itemsAdded.filter(item => toaPurpleItems.includes(item.id), false);
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

				if (shouldShowImage) {
					resultMessage += `\n${deathStr} **${user}**`;
				} else {
					resultMessage += `\n${deathStr} **${user}** received: ${str}`;
				}

				const xpStrings = await handleDOAXP(user, quantity, cm);
				resultMessage += ` ${xpStrings.join(', ')}`;
			})
		);

		if (messages.length > 0) {
			resultMessage += `\n\n${messages.join('\n')}`;
		}

		await updateBankSetting('toa_loot', totalLoot.totalLoot());
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
				loot: teamLoot.get(i.id)
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
									loot: teamLoot.totalLoot(),
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
							loot: teamLoot.get(u.id),
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
