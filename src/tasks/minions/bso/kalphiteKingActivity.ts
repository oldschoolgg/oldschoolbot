import { Emoji } from '@oldschoolgg/toolkit/constants';
import { SimpleTable } from '@oldschoolgg/toolkit/structures';
import { calcWhatPercent, noOp, percentChance } from 'e';
import { Bank } from 'oldschooljs';

import { kalphiteKingCL } from '@/lib/data/CollectionsExport.js';
import { isDoubleLootActive } from '@/lib/doubleLoot.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { KalphiteKingMonster } from '@/lib/minions/data/killableMonsters/custom/bosses/KalphiteKing.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import { addMonsterXP } from '@/lib/minions/functions/index.js';
import { TeamLoot } from '@/lib/simulation/TeamLoot.js';
import { getUsersCurrentSlayerInfo } from '@/lib/slayer/slayerUtil.js';
import type { BossActivityTaskOptions } from '@/lib/types/minions.js';
import { getKalphiteKingGearStats } from '@/lib/util/getKalphiteKingGearStats.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';

interface KalphiteKingUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
	user: MUser;
}

export const kalphiteKingTask: MinionTask = {
	type: 'KalphiteKing',
	async run(data: BossActivityTaskOptions) {
		const { channelID, userID, users, quantity, duration } = data;
		const teamsLoot = new TeamLoot([]);
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: KalphiteKingUser[] = [];

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await mUserFetch(id).catch(noOp);
			if (!user) continue;
			const [data] = await getKalphiteKingGearStats(user, users);
			parsedUsers.push({ ...data, id: user.id, user });
		}

		// Store total amount of deaths
		const deaths: Record<string, number> = {};

		for (let i = 0; i < quantity; i++) {
			const teamTable = new SimpleTable<string>();

			// Track deaths per kill so you don't stay dead the entire trip.
			const deathsThisKill: Record<string, number> = {};

			let teamFailed = false;
			for (const user of parsedUsers.sort((a, b) => b.chanceOfDeath - a.chanceOfDeath)) {
				const currentDeaths = Object.keys(deathsThisKill).length;
				if (calcWhatPercent(currentDeaths, users.length) >= 50) {
					// If over 50% of the team died, the entire team dies.
					teamFailed = true;
				}

				if (teamFailed || percentChance(user.chanceOfDeath)) {
					deaths[user.id] = deaths[user.id] ? deaths[user.id] + 1 : 1;
					// Mark user as dead this kill:
					deathsThisKill[user.id] = 1;
				} else {
					// weight on damagedone
					teamTable.add(user.id, user.damageDone);
				}
			}

			const loot = new Bank();
			loot.add(KalphiteKingMonster.table.kill(1, {}));

			const winner = teamTable.roll();
			if (!winner) continue;
			teamsLoot.add(winner, loot);

			kcAmounts[winner] = kcAmounts[winner] ? ++kcAmounts[winner] : 1;
		}

		//Roll for Drygores
		for (const [userID, kc] of Object.entries(kcAmounts)) {
			const user = await mUserFetch(userID);

			KalphiteKingMonster.specialLoot?.({
				loot: teamsLoot.get(userID),
				ownedItems: new Bank(),
				quantity: kc,
				cl: user.cl.clone()
			});
		}

		//Check for double loot
		for (const user of users) {
			const loot = teamsLoot.get(user);
			if (loot) {
				if (isDoubleLootActive(duration)) {
					loot.multiply(2);
				}
			}
		}

		const leaderUser = parsedUsers.find(p => p.id === userID)?.user ?? parsedUsers[0].user;
		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${KalphiteKingMonster.name}!\n\n`;

		let soloXP = '';
		let soloPrevCl = null;
		let soloItemsAdded = null;

		const totalLoot = new Bank();
		for (const [userID, loot] of teamsLoot.entries()) {
			const { user } = parsedUsers.find(p => p.id === userID)!;
			if (!user) continue;
			totalLoot.add(loot);
			const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementKC(KalphiteKingMonster.id, kcToAdd);
			const purple = loot.itemIDs.some(id => kalphiteKingCL.includes(id));

			const usersTask = await getUsersCurrentSlayerInfo(user.id);
			const isOnTask =
				usersTask.assignedTask !== null &&
				usersTask.currentTask !== null &&
				usersTask.assignedTask.monsters.includes(KalphiteKingMonster.id);

			const xpStr = await addMonsterXP(user, {
				monsterID: KalphiteKingMonster.id,
				quantity: Math.ceil(quantity / users.length),
				duration,
				isOnTask,
				taskQuantity: quantity
			});
			if (isOnTask) {
				await prisma.slayerTask.update({
					where: {
						id: usersTask.currentTask?.id
					},
					data: {
						quantity_remaining: Math.max(0, usersTask.currentTask!.quantity_remaining - quantity)
					}
				});
			}

			if (user.id === userID) {
				soloXP = xpStr;
				soloPrevCl = previousCL;
				soloItemsAdded = itemsAdded;
			}

			resultStr += `${purple ? Emoji.Purple : ''} ${
				isOnTask ? Emoji.Slayer : ''
			} **${user} received:** ||${new Bank(loot)}||\n`;

			announceLoot({
				user: leaderUser,
				monsterID: KalphiteKingMonster.id,
				loot: new Bank(loot),
				notifyDrops: KalphiteKingMonster.notifyDrops,
				team: {
					leader: leaderUser,
					lootRecipient: user,
					size: users.length
				}
			});
		}

		updateBankSetting('kk_loot', totalLoot);

		await trackLoot({
			duration,
			totalLoot,
			type: 'Monster',
			changeType: 'loot',
			id: KalphiteKingMonster.name,
			kc: quantity,
			users: users.map(i => ({
				id: i,
				loot: teamsLoot.get(i),
				duration
			}))
		});

		// Show deaths in the result
		const deathEntries = Object.entries(deaths);
		if (deathEntries.length > 0) {
			const deaths = [];
			for (const [id, qty] of deathEntries) {
				const { user } = parsedUsers.find(p => p.id === id)!;
				deaths.push(`**${user.usernameOrMention}**: ${qty}x`);
			}
			resultStr += `\n**Deaths**: ${deaths.join(', ')}.`;
		}

		if (users.length > 1) {
			if (Object.values(kcAmounts).length === 0) {
				resultStr = `${users
					.map(id => `<@${id}>`)
					.join(' ')} Your team all died, and failed to defeat the Kalphite King.`;
			}
			handleTripFinish(leaderUser, channelID, resultStr, undefined, data, null);
		} else {
			const image = !kcAmounts[userID]
				? undefined
				: (
						await makeBankImage({
							bank: soloItemsAdded ?? new Bank(),
							title: `Loot From ${quantity} Kalphite King`,
							user: leaderUser,
							previousCL: soloPrevCl ?? undefined
						})
					).file.attachment;
			handleTripFinish(
				leaderUser,
				channelID,
				!kcAmounts[userID]
					? `${leaderUser}, ${leaderUser.minionName} died in all their attempts to kill the Kalphite King, they apologize and promise to try harder next time.`
					: `${leaderUser}, ${leaderUser.minionName} finished killing ${quantity} ${
							KalphiteKingMonster.name
						}, you died ${deaths[userID] ?? 0} times. Your Kalphite King KC is now ${await leaderUser.getKC(
							KalphiteKingMonster.id
						)}.\n\n${soloXP}`,
				image!,
				data,
				soloItemsAdded
			);
		}
	}
};
