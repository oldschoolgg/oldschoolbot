import { noOp, percentChance } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank, Misc } from 'oldschooljs';

import { BitField, Emoji, NIGHTMARE_ID, PHOSANI_NIGHTMARE_ID } from '../../../lib/constants';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import isImportantItemForMonster from '../../../lib/minions/functions/isImportantItemForMonster';
import { trackLoot } from '../../../lib/settings/prisma';
import { NightmareActivityTaskOptions } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import { getNightmareGearStats } from '../../../lib/util/getNightmareGearStats';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../../lib/util/webhook';
import { NightmareMonster } from './../../../lib/minions/data/killableMonsters/index';

interface NightmareUser {
	user: KlasaUser;
	chanceOfDeath: number;
	damageDone: number;
}

const RawNightmare = Misc.Nightmare;

export default class extends Task {
	async run(data: NightmareActivityTaskOptions) {
		const { channelID, leader, users, quantity, duration, isPhosani = false } = data;

		const monsterID = isPhosani ? PHOSANI_NIGHTMARE_ID : NightmareMonster.id;
		const monsterName = isPhosani ? "Phosani's Nightmare" : 'Nightmare';

		const teamsLoot: { [key: string]: Bank } = {};
		const teamsPreviousCL: { [key: string]: Bank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NightmareUser[] = [];
		const totalLoot = new Bank();

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await this.client.fetchUser(id).catch(noOp);
			if (!user) continue;
			const [data] = getNightmareGearStats(user, users, isPhosani);
			parsedUsers.push({ ...data, user });
			teamsLoot[id] = new Bank();
		}

		// Store total amount of deaths
		const deaths: Record<string, number> = {};

		for (let i = 0; i < quantity; i++) {
			const _loot = RawNightmare.kill({
				team: parsedUsers.map(user => ({
					id: user.user.id,
					damageDone: users.length === 1 ? 2400 : randomVariation(user.damageDone, 5)
				})),
				isPhosani
			});

			const loot: Record<string, Bank> = {};
			for (const [id, itemBank] of Object.entries(_loot)) {
				loot[id] = new Bank(itemBank);
			}

			for (const { user, chanceOfDeath } of parsedUsers) {
				kcAmounts[user.id] = Boolean(kcAmounts[user.id]) ? ++kcAmounts[user.id] : 1;
				const died = percentChance(chanceOfDeath);
				if (died) {
					deaths[user.id] = deaths[user.id] ? ++deaths[user.id] : 1;
					kcAmounts[user.id]--;
				} else {
					if (user.owns('Slepey tablet') || user.bitfield.includes(BitField.HasSlepeyTablet)) {
						loot[user.id].remove('Slepey tablet', loot[user.id].amount('Slepey tablet'));
					}
					loot[user.id].bank;
					teamsLoot[user.id].add(loot[user.id]);
				}
			}
		}

		const leaderUser = await this.client.fetchUser(leader);

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${NightmareMonster.name}!\n\n`;

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.fetchUser(userID).catch(noOp);
			if (!user) continue;
			await addMonsterXP(user, {
				monsterID: NIGHTMARE_ID,
				quantity: Math.ceil(quantity / users.length),
				duration,
				isOnTask: false,
				taskQuantity: null
			});

			// Fix purple items on solo kills
			const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

			totalLoot.add(itemsAdded);

			// Only add previousCL for leader
			if (user.id === leader) teamsPreviousCL[user.id] = previousCL;

			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementMonsterScore(monsterID, kcToAdd);
			const purple = loot.items().some(([item]) => isImportantItemForMonster(item.id, NightmareMonster));

			resultStr += `${purple ? Emoji.Purple : ''} **${user} received:** ||${loot}||\n`;

			announceLoot({
				user,
				monsterID,
				loot,
				notifyDrops: NightmareMonster.notifyDrops,
				team: {
					leader: leaderUser,
					lootRecipient: user,
					size: users.length
				}
			});
		}

		// Show deaths in the result
		const deathEntries = Object.entries(deaths);
		if (deathEntries.length > 0) {
			const deaths = [];
			for (const [id, qty] of deathEntries) {
				const user = await this.client.fetchUser(id).catch(noOp);
				if (!user) continue;
				deaths.push(`**${user.username}**: ${qty}x`);
			}
			resultStr += `\n**Deaths**: ${deaths.join(', ')}.`;
		}

		await trackLoot({
			loot: totalLoot,
			id: monsterName,
			type: 'Monster',
			changeType: 'loot',
			duration,
			kc: quantity,
			teamSize: users.length
		});

		if (users.length > 1) {
			sendToChannelID(this.client, channelID, { content: resultStr });
		} else if (!kcAmounts[leader]) {
			sendToChannelID(this.client, channelID, {
				content: `${leaderUser}, ${leaderUser.minionName} died in all their attempts to kill the ${monsterName}, they apologize and promise to try harder next time.`
			});
		} else {
			const { image } = await this.client.tasks
				.get('bankImage')!
				.generateBankImage(
					teamsLoot[leader],
					`${quantity}x Nightmare`,
					true,
					{ showNewCL: 1 },
					leaderUser,
					teamsPreviousCL[leader]
				);

			const kc = leaderUser.getKC(monsterID);
			handleTripFinish(
				this.client,
				leaderUser,
				channelID,
				`${leaderUser}, ${leaderUser.minionName} finished killing ${quantity} ${monsterName}, you died ${
					deaths[leader] ?? 0
				} times. Your ${monsterName} KC is now ${kc}.`,
				['nightmare', [isPhosani ? 'phosani' : 'solo'], true],
				image!,
				data,
				totalLoot
			);
		}
	}
}
