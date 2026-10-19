import { calcPerHour, Emoji, noOp } from '@oldschoolgg/toolkit';
import { Bank, Monsters, resolveItems } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import type { YamaActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

const yamaPurpleItems = resolveItems(['Soulflame horn', 'Oathplate helm', 'Oathplate chest', 'Oathplate legs']);

const yamaContributionScaledDrops = resolveItems([
	'Soulflame horn',
	'Oathplate helm',
	'Oathplate chest',
	'Oathplate legs',
	'Dossier',
	'Oathplate shards',
	'Yami'
]);

function rollContributionScaledYamaLoot(rng: RNGProvider, contribution: number): Bank {
	const loot = Monsters.Yama.kill(1, { rng });
	const scaledContribution = Math.max(0, Math.min(1, contribution));

	for (const [item, quantity] of loot.items()) {
		if (yamaContributionScaledDrops.includes(item.id)) {
			if (rng.percentChance(scaledContribution * 100)) {
				loot.set(item.id, Math.max(1, Math.floor(quantity * scaledContribution)));
			} else {
				loot.remove(item.id, quantity);
			}
			continue;
		}
		loot.set(item.id, Math.max(1, Math.floor(quantity * scaledContribution)));
	}

	return loot;
}

export const yamaTask: MinionTask = {
	type: 'Yama',
	async run(data: YamaActivityTaskOptions, { handleTripFinish, user: leaderUser, rng }) {
		const { quantity, users, duration, channelId, teamMembers, solo } = data;
		const monster = killableMonsters.find(mon => mon.id === Monsters.Yama.id)!;
		const teamLoot: Record<string, Bank> = {};
		const kcAmounts: Record<string, number> = {};
		const deathAmounts: Record<string, number> = {};
		let wipes = 0;

		for (const member of teamMembers) {
			teamLoot[member.id] = new Bank();
			kcAmounts[member.id] = 0;
			deathAmounts[member.id] = 0;
		}

		for (let i = 0; i < quantity; i++) {
			const aliveMembers = [];
			for (const member of teamMembers) {
				if (rng.percentChance(member.deathChance)) {
					deathAmounts[member.id]++;
				} else {
					aliveMembers.push(member);
				}
			}

			if (aliveMembers.length === 0) {
				wipes++;
				continue;
			}

			for (const member of aliveMembers) {
				const loot = rollContributionScaledYamaLoot(rng, member.contribution / 100);
				teamLoot[member.id].add(loot);
				kcAmounts[member.id]++;
			}
		}

		const totalLoot = new Bank();
		const lootTrackUsers = [];
		const files = [];
		const resultLines: string[] = [];

		for (const member of teamMembers) {
			const user = await mUserFetch(member.id).catch(noOp);
			if (!user) continue;
			const loot = teamLoot[member.id] ?? new Bank();
			const kc = kcAmounts[member.id] ?? 0;
			const deaths = deathAmounts[member.id] ?? 0;
			if (kc > 0) {
				await user.addMonsterXP({
					monsterID: monster.id,
					quantity: kc,
					duration,
					isOnTask: false,
					taskQuantity: null
				});
				await user.incrementKC(monster.id, kc);
				const itemResult = await user.transactItems({
					collectionLog: true,
					itemsToAdd: loot
				});
				totalLoot.add(itemResult.itemsAdded);
				lootTrackUsers.push({ id: user.id, loot: itemResult.itemsAdded, duration });
				const purple = yamaPurpleItems.some(itemID => itemResult.itemsAdded.has(itemID));
				resultLines.push(
					`${purple ? Emoji.Purple : ''} **${user} received:** ||${itemResult.itemsAdded}|| (${kc} KC, ${deaths} deaths)`
				);
				announceLoot({
					user,
					monsterID: monster.id,
					loot: itemResult.itemsAdded,
					notifyDrops: monster.notifyDrops,
					team: {
						leader: leaderUser,
						lootRecipient: user,
						size: users.length
					}
				});
				if (itemResult.itemsAdded.length > 0) {
					files.push(
						await makeBankImage({
							bank: itemResult.itemsAdded,
							title: `Loot From ${kc} Yama:`,
							user,
							previousCL: itemResult.previousCL
						})
					);
				}
			} else {
				resultLines.push(`**${user} received:** No loot (${deaths} deaths)`);
			}
		}

		if (lootTrackUsers.length > 0) {
			await trackLoot({
				totalLoot,
				id: monster.name,
				type: 'Monster',
				changeType: 'loot',
				kc: Object.values(kcAmounts).reduce((sum, kc) => sum + kc, 0),
				duration,
				users: lootTrackUsers
			});
		}

		return handleTripFinish({
			user: leaderUser,
			channelId,
			message: {
				content: `${leaderUser}, your ${solo ? 'solo' : 'duo'} Yama trip finished. The party attempted ${quantity}x Yama (${calcPerHour(
					quantity,
					duration
				).toFixed(1)}/hr), with ${wipes} full wipe${wipes === 1 ? '' : 's'}.\n\n${resultLines.join('\n')}`,
				files
			},
			data,
			loot: totalLoot
		});
	}
};
