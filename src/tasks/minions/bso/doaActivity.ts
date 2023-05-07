import { formatOrdinal } from '@oldschoolgg/toolkit';
import { bold } from 'discord.js';
import { randArrItem, roll, Time, uniqueArr } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { drawChestLootImage } from '../../../lib/bankImage';
import { Emoji, Events, toaPurpleItems } from '../../../lib/constants';
import { toaCL } from '../../../lib/data/CollectionsExport';
import { DOARooms } from '../../../lib/depthsOfAtlantis';
import { trackLoot } from '../../../lib/lootTrack';
import { resolveAttackStyles } from '../../../lib/minions/functions';
import { getMinigameScore, incrementMinigameScore } from '../../../lib/settings/settings';
import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { DOAOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

const UniqueTable = new LootTable().add('Oceanic relic').add('Oceanic dye').add('Aquifer aegis').add('Shark jaw');
const NonUniqueTable = new LootTable()
	.add('Coal', [1000, 2000])
	.add('Runite ore', [10, 20])
	.add('Dragon arrowtips', [100, 200])
	.add('Dragon dart tip', [100, 200])
	.add('Dragon javelin heads', [100, 200])
	.add('Dragonstone bolt tips', [100, 200])
	.add('Onyx bolt tips', [100, 200])
	.add('Dragon arrow', [100, 200])
	.add('Dragon dart', [100, 200])
	.add('Dragon javelin', [100, 200])
	.add('Dragonstone bolts', [100, 200])
	.add('Onyx bolts', [100, 200])
	.add('Dragon arrow', [100, 200])
	.add('Dragon dart', [100, 200])
	.add('Dragon javelin', [100, 200]);

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
	points: number;
	mUser: MUser;
	deaths: number;
	kc: number;
}

export const doaTask: MinionTask = {
	type: 'DepthsOfAtlantis',
	async run(data: DOAOptions) {
		const { channelID, cm, duration, leader, quantity, users, raids } = data;
		const isSolo = users.length === 0;
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
				points: 0,
				deaths: 0,
				kc: await getMinigameScore(user.id, 'tombs_of_amascut')
			});
		}

		let messages: string[] = [];

		const teamLoot = new TeamLoot();

		for (const raid of raids) {
			if (raid.wipedRoom) continue;
			const uniqueRecipient = roll(100) ? randArrItem(allUsers) : undefined;
			for (let i = 0; i < raid.users.length; i++) {
				if (raid.users[i].deaths.length >= 2) continue;
				const user = allUsers[i];
				if (uniqueRecipient && user.id === uniqueRecipient.id) {
					teamLoot.add(uniqueRecipient.id, UniqueTable.roll());
				} else {
					teamLoot.add(user.id, NonUniqueTable.roll());
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
			? `${leaderSoloUser}, your minion finished ${
					quantity === 1 ? 'a' : `${quantity}x`
			  } Depths of Atlantis raid${quantity > 1 ? 's' : ''}! Your KC is now ${
					minigameIncrementResult[0].newScore
			  }.\n`
			: `<@${leader}> Your Raid${quantity > 1 ? 's have' : ' has'} finished.\n`;

		const shouldShowImage = allUsers.length <= 3 && totalLoot.entries().every(i => i[1].length <= 6);

		await Promise.all(
			Array.from(raidResults.entries()).map(async ([userID, userData]) => {
				const { points, deaths, mUser: user } = userData;

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
					resultMessage += `\n${deathStr} **${user}** ${bold(points.toLocaleString())} points`;
				} else {
					resultMessage += `\n${deathStr} **${user}** received: ${str} (${bold(
						points.toLocaleString()
					)} points)`;
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

		function makeCustomTexts(userID: string) {
			const user = raidResults.get(userID)!;
			return [
				{
					text: `${user.points.toLocaleString()} points`,
					x: 149,
					y: 150
				},
				{
					text: `${user.deaths} deaths`,
					x: 149,
					y: 165
				}
			];
		}

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
									customTexts: makeCustomTexts(leaderSoloUser.id)
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
							customTexts: makeCustomTexts(u.id)
						})),
						type: 'Depths of Atlantis'
				  })
				: undefined,
			data,
			null
		);
	}
};
