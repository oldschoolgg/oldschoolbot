import { calcWhatPercent, noOp, percentChance } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { Emoji } from '../../../lib/constants';
import { kalphiteKingCL } from '../../../lib/data/CollectionsExport';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { KalphiteKingMonster } from '../../../lib/minions/data/killableMonsters/custom/bosses/KalphiteKing';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { prisma, trackLoot } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { ItemBank } from '../../../lib/types';
import { BossActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, updateBankSetting } from '../../../lib/util';
import { getKalphiteKingGearStats } from '../../../lib/util/getKalphiteKingGearStats';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../../lib/util/webhook';

interface NexUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
}

export default class extends Task {
	async run(data: BossActivityTaskOptions) {
		const { channelID, userID, users, quantity, duration } = data;
		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NexUser[] = [];

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await this.client.fetchUser(id).catch(noOp);
			if (!user) continue;
			const [data] = getKalphiteKingGearStats(user, users);
			parsedUsers.push({ ...data, id: user.id });
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
					deaths[user.id] = Boolean(deaths[user.id]) ? deaths[user.id] + 1 : 1;
					// Mark user as dead this kill:
					deathsThisKill[user.id] = 1;
				} else {
					// weight on damagedone
					teamTable.add(user.id, user.damageDone);
				}
			}

			const loot = new Bank();
			loot.add(KalphiteKingMonster.table.kill(1, {}));
			if (isDoubleLootActive(this.client, duration)) {
				loot.multiply(2);
			}
			const winner = teamTable.roll()?.item;
			if (!winner) continue;
			const currentLoot = teamsLoot[winner];
			if (!currentLoot) teamsLoot[winner] = loot.bank;
			else teamsLoot[winner] = addBanks([currentLoot, loot.bank]);

			kcAmounts[winner] = Boolean(kcAmounts[winner]) ? ++kcAmounts[winner] : 1;
		}

		const leaderUser = await this.client.fetchUser(userID);
		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${KalphiteKingMonster.name}!\n\n`;

		let soloXP = '';
		let soloPrevCl = null;
		let soloItemsAdded = null;

		const totalLoot = new Bank();
		for (let [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.fetchUser(userID).catch(noOp);
			if (!user) continue;
			totalLoot.add(loot);
			const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementMonsterScore(KalphiteKingMonster.id, kcToAdd);
			const purple = Object.keys(loot).some(id => kalphiteKingCL.includes(parseInt(id)));

			const usersTask = await getUsersCurrentSlayerInfo(user.id);
			const isOnTask =
				usersTask.assignedTask !== null &&
				usersTask.currentTask !== null &&
				usersTask.assignedTask.monsters.includes(KalphiteKingMonster.id);

			let xpStr = await addMonsterXP(user, {
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

		updateBankSetting(this.client, ClientSettings.EconomyStats.KalphiteKingLoot, totalLoot);

		await trackLoot({
			duration,
			teamSize: users.length,
			loot: totalLoot,
			type: 'Monster',
			changeType: 'loot',
			id: KalphiteKingMonster.name,
			kc: quantity
		});

		// Show deaths in the result
		const deathEntries = Object.entries(deaths);
		if (deathEntries.length > 0) {
			const deaths = [];
			for (const [id, qty] of deathEntries) {
				const user = await this.client.fetchUser(id).catch(noOp);
				if (!user) continue;
				deaths.push(`**${user}**: ${qty}x`);
			}
			resultStr += `\n**Deaths**: ${deaths.join(', ')}.`;
		}

		if (users.length > 1) {
			if (Object.values(kcAmounts).length === 0) {
				sendToChannelID(channelID, {
					content: `${users
						.map(id => `<@${id}>`)
						.join(' ')} Your team all died, and failed to defeat the Kalphite King.`
				});
			} else {
				sendToChannelID(channelID, { content: resultStr });
			}
		} else {
			const image = !kcAmounts[userID]
				? undefined
				: (
						await this.client.tasks
							.get('bankImage')!
							.generateBankImage(
								soloItemsAdded!,
								`Loot From ${quantity} Kalphite King:`,
								true,
								{ showNewCL: 1 },
								leaderUser,
								soloPrevCl!
							)
				  ).image;
			handleTripFinish(
				leaderUser,
				channelID,
				!kcAmounts[userID]
					? `${leaderUser}, ${leaderUser.minionName} died in all their attempts to kill the Kalphite King, they apologize and promise to try harder next time.`
					: `${leaderUser}, ${leaderUser.minionName} finished killing ${quantity} ${
							KalphiteKingMonster.name
					  }, you died ${deaths[userID] ?? 0} times. Your Kalphite King KC is now ${
							leaderUser.settings.get(UserSettings.MonsterScores)[KalphiteKingMonster.id] ?? 0
					  }.\n\n${soloXP}`,
				['kk', ['solo'], true],
				image!,
				data,
				soloItemsAdded
			);
		}
	}
}
