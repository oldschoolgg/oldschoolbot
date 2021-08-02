import { noOp, objectKeys, objectValues, percentChance, shuffleArr } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';
import { addBanks } from 'oldschooljs/dist/util';

import { DOUBLE_LOOT_ACTIVE, Emoji } from '../../../lib/constants';
import { kalphiteKingCL } from '../../../lib/data/CollectionsExport';
import { GearStats } from '../../../lib/gear';
import { KalphiteKingMonster } from '../../../lib/kalphiteking';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { BossUser } from '../../../lib/structures/Boss';
import { ItemBank } from '../../../lib/types';
import { NewBossOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { getKalphiteKingGearStats } from '../../../lib/util/getKalphiteKingGearStats';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../../lib/util/webhook';

const methodsOfDeath = ['Buried', 'Eaten', 'Crushed', 'Exploded', 'Pierced'];

type KKBossUser = BossUser & {
	kKData?: {
		chanceOfDeath: number;
		damageDone: number;
		percentAttackStrength: number;
		totalGearPercent: number;
		percentWeaponAttackCrush: number;
		attackCrushStat: number;
		kc: number;
		gearStats: GearStats;
	};
};

export default class extends Task {
	async run(data: NewBossOptions) {
		const { channelID, users: idArr, duration, bossUsers: _bossUsers, quantity } = data;
		const deaths: Record<string, { user: KlasaUser; qty: number; kcDeaths: Record<number, number> }> = {};
		const bossUsers: KKBossUser[] = await Promise.all(
			_bossUsers.map(async u => ({
				...u,
				itemsToRemove: new Bank(u.itemsToRemove),
				user: await this.client.users.fetch(u.user)
			}))
		);
		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		// eslint-disable-next-line prefer-destructuring
		for (const bU of bossUsers) bU.kKData = getKalphiteKingGearStats(bU.user, idArr)[0];

		const leader = bossUsers.find(b => b.user.id === data.userID)!.user;

		// Deaths
		for (let i = 0; i < quantity; i++) {
			let kcDeath = [];
			for (const { user, deathChance } of bossUsers) {
				if (percentChance(deathChance)) {
					kcDeath.push(user);
				}
			}
			// If over 50% died (save in cases of duo as duo playes can still solo if one dies) entire team dies
			if (bossUsers.length > 2 && kcDeath.length >= Math.ceil(bossUsers.length / 2)) {
				kcDeath = [];
				kcDeath = bossUsers.map(b => b.user);
			}
			// Add user deaths
			for (const kcDeathUser of kcDeath) {
				if (deaths[kcDeathUser.id]) {
					deaths[kcDeathUser.id].qty++;
					deaths[kcDeathUser.id].kcDeaths[i] = 1;
				} else deaths[kcDeathUser.id] = { qty: 1, user: kcDeathUser, kcDeaths: { [i]: 1 } };
			}
		}

		await Promise.all(bossUsers.map(u => u.user.incrementMonsterScore(KalphiteKingMonster.id, quantity)));
		const killStr = `${leader}, your party finished killing ${quantity}x ${KalphiteKingMonster.name}!\n\n`;
		let resultStr = `${killStr}${Emoji.Casket} **Loot:**\n`;

		const totalLoot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const teamTable = new SimpleTable<string>();
			for (const user of bossUsers) {
				if (!deaths[user.user.id] || !deaths[user.user.id].kcDeaths[i]) {
					teamTable.add(user.user.id, user.kKData!.damageDone);
				}
			}
			if (teamTable.length === 0) continue;
			const loot = new Bank();
			loot.add(KalphiteKingMonster.table.kill(1, {}));
			if (DOUBLE_LOOT_ACTIVE) loot.multiply(2);
			const winner = teamTable.roll()?.item;
			const currentLoot = teamsLoot[winner];
			if (!currentLoot) teamsLoot[winner] = loot.bank;
			else teamsLoot[winner] = addBanks([currentLoot, loot.bank]);

			kcAmounts[winner] = Boolean(kcAmounts[winner]) ? ++kcAmounts[winner] : 1;
		}

		let soloXP = '';
		let soloPrevCl = null;
		let soloItemsAdded = null;

		for (let [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			totalLoot.add(loot);
			const { previousCL, itemsAdded } = await user.addItemsToBank(loot, true);
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
				quantity: Math.ceil(quantity / bossUsers.length),
				duration,
				isOnTask,
				taskQuantity: quantity
			});
			if (isOnTask) {
				usersTask.currentTask!.quantityRemaining = Math.max(
					0,
					usersTask.currentTask!.quantityRemaining - quantity
				);
				await usersTask.currentTask!.save();
			}
			if (user.id === userID) {
				soloXP = xpStr;
				soloPrevCl = previousCL;
				soloItemsAdded = itemsAdded;
			}

			resultStr += `${purple ? Emoji.Purple : ''} ${
				isOnTask ? Emoji.Slayer : ''
			} **${user} received:** ||${new Bank(loot)}||\n`;

			announceLoot(this.client, leader, KalphiteKingMonster, loot, {
				leader,
				lootRecipient: user,
				size: bossUsers.length
			});
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.KalphiteKingLoot, totalLoot);

		const noLootUsers = bossUsers.filter(f => {
			return !objectKeys(teamsLoot).includes(f.user.id) && !objectKeys(deaths).includes(f.user.id);
		});
		if (noLootUsers.length > 0) {
			resultStr += `\n**Got no loot**: ${noLootUsers.map(u => `${u.user}`)}`;
		}

		if (objectValues(deaths).length > 0) {
			resultStr += `\n**Died in battle**: ${objectValues(deaths).map(
				u =>
					`${u.user.toString()}${u.qty > 1 ? ` x${u.qty}` : ''} (${shuffleArr([...methodsOfDeath])
						.slice(0, u.qty)
						.join(', ')})`
			)}.`;
		}

		if (bossUsers.length > 1) {
			if (Object.values(kcAmounts).length === 0) {
				sendToChannelID(this.client, channelID, {
					content: `${bossUsers
						.map(id => `<@${id.user.id}>`)
						.join(' ')} Your team all died, and failed to defeat the Kalphite King.`
				});
			} else {
				sendToChannelID(this.client, channelID, { content: resultStr });
			}
		} else {
			const image = !kcAmounts[leader.id]
				? undefined
				: (
						await this.client.tasks
							.get('bankImage')!
							.generateBankImage(
								soloItemsAdded!,
								`Loot From ${
									quantity - (deaths[leader.id] ? deaths[leader.id].qty : 0)
								} Kalphite King:`,
								true,
								{ showNewCL: 1 },
								leader,
								soloPrevCl!
							)
				  ).image;
			handleTripFinish(
				this.client,
				leader,
				channelID,
				!kcAmounts[leader.id]
					? `${leader}, ${leader.minionName} died in all their attempts to kill the Kalphite King, they apologize and promise to try harder next time.`
					: `${leader}, ${leader.minionName} finished killing ${quantity} ${KalphiteKingMonster.name}${
							deaths[leader.id] ? `, you died ${deaths[leader.id].qty} times` : ''
					  }. Your Kalphite King KC is now ${
							leader.settings.get(UserSettings.MonsterScores)[KalphiteKingMonster.id] ?? 0
					  }.\n\n${soloXP}`,
				res => {
					leader.log('continued kk');
					return this.client.commands.get('kk')!.run(res, ['solo']);
				},
				image!,
				data,
				soloItemsAdded
			);
		}
	}
}
