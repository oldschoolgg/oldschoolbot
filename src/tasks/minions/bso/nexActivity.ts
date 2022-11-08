import { calcWhatPercent, noOp, percentChance, randArrItem } from 'e';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { Emoji } from '../../../lib/constants';
import { nexCL, nexUniqueDrops } from '../../../lib/data/CollectionsExport';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { trackLoot } from '../../../lib/lootTrack';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { NexMonster } from '../../../lib/nex';
import { ItemBank } from '../../../lib/types';
import { BossActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { getNexGearStats } from '../../../lib/util/getNexGearStats';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { sendToChannelID } from '../../../lib/util/webhook';
import { updateBankSetting } from '../../../mahoji/mahojiSettings';

interface NexUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
	user: MUser;
}

export const nexTask: MinionTask = {
	type: 'Nex',
	async run(data: BossActivityTaskOptions) {
		const { channelID, userID, users, quantity, duration } = data;
		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NexUser[] = [];

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await mUserFetch(id).catch(noOp);
			if (!user) continue;
			const [data] = getNexGearStats(user, users);
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
					deaths[user.id] = Boolean(deaths[user.id]) ? deaths[user.id] + 1 : 1;
					// Mark user as dead this kill:
					deathsThisKill[user.id] = 1;
				} else {
					// weight on damagedone
					teamTable.add(user.id, user.damageDone);
				}
			}

			const loot = new Bank();
			loot.add(NexMonster.table.kill(1, {}));
			if (roll(80 + users.length * 2)) {
				loot.add(randArrItem(nexUniqueDrops), 1);
			}
			if (isDoubleLootActive(duration)) {
				loot.multiply(2);
			}
			const winner = teamTable.roll()?.item;
			if (!winner) continue;
			const currentLoot = teamsLoot[winner];
			if (!currentLoot) teamsLoot[winner] = loot.bank;
			else teamsLoot[winner] = new Bank().add(currentLoot).add(loot).bank;

			kcAmounts[winner] = Boolean(kcAmounts[winner]) ? ++kcAmounts[winner] : 1;
		}

		const leaderUser = parsedUsers.find(p => p.id === userID)?.user ?? parsedUsers[0].user;
		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${NexMonster.name}!\n\n`;
		const totalLoot = new Bank();

		let soloXP = '';
		let soloPrevCl = new Bank();
		let soloItemsAdded: Bank = new Bank();

		for (let [userID, loot] of Object.entries(teamsLoot)) {
			const { user } = parsedUsers.find(p => p.id === userID)!;
			if (!user) continue;
			let xpStr = '';
			if (kcAmounts[user.id]) {
				xpStr = await addMonsterXP(user, {
					monsterID: NexMonster.id,
					quantity: Math.ceil(quantity / users.length),
					duration,
					isOnTask: false,
					taskQuantity: null
				});
			}
			totalLoot.add(loot);
			const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

			if (user.id === userID) {
				soloXP = xpStr;
				soloPrevCl = previousCL;
				soloItemsAdded = itemsAdded;
			}

			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementKC(NexMonster.id, kcToAdd);
			const purple = Object.keys(loot).some(id => nexCL.includes(parseInt(id)));

			resultStr += `${purple ? Emoji.Purple : ''} **${user} received:** ||${new Bank(loot)}||\n`;

			announceLoot({
				user: leaderUser,
				monsterID: NexMonster.id,
				loot: new Bank(loot),
				notifyDrops: NexMonster.notifyDrops,
				team: {
					leader: leaderUser,
					lootRecipient: user,
					size: users.length
				}
			});
		}

		updateBankSetting('nex_loot', totalLoot);
		await trackLoot({
			duration,
			totalLoot,
			type: 'Monster',
			changeType: 'loot',
			id: NexMonster.name,
			kc: quantity,
			users: users.map(i => ({
				id: i,
				loot: teamsLoot[i] ? new Bank(teamsLoot[i]) : new Bank(),
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
				sendToChannelID(channelID, {
					content: `${users.map(id => `<@${id}>`).join(' ')} Your team all died, and failed to defeat Nex.`
				});
			} else {
				sendToChannelID(channelID, { content: resultStr });
			}
		} else {
			const image = !kcAmounts[userID]
				? undefined
				: (
						await makeBankImage({
							bank: soloItemsAdded,
							title: `Loot From ${quantity} ${NexMonster.name}:`,
							user: leaderUser,
							previousCL: soloPrevCl
						})
				  ).file.attachment;
			handleTripFinish(
				leaderUser,
				channelID,
				!kcAmounts[userID]
					? `${leaderUser}, ${leaderUser.minionName} died in all their attempts to kill Nex, they apologize and promise to try harder next time.`
					: `${leaderUser}, ${leaderUser.minionName} finished killing ${quantity} ${
							NexMonster.name
					  }, you died ${deaths[userID] ?? 0} times. Your Nex KC is now ${leaderUser.getKC(
							NexMonster.id
					  )}.\n\n${soloXP}`,
				image!,
				data,
				soloItemsAdded
			);
		}
	}
};
