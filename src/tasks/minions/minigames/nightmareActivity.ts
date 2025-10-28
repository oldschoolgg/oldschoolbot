import { percentChance, randomVariation } from '@oldschoolgg/rng';
import { Bank, EMonster, Misc } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { NightmareMonster } from '@/lib/minions/data/killableMonsters/index.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import type { NightmareActivityTaskOptions } from '@/lib/types/minions.js';
import { getNightmareGearStats } from '@/lib/util/getNightmareGearStats.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

const RawNightmare = Misc.Nightmare;

export const nightmareTask: MinionTask = {
	type: 'Nightmare',
	async run(data: NightmareActivityTaskOptions, { user, handleTripFinish }) {
		const { channelID, quantity, duration, isPhosani = false, method } = data;

		const monsterID = isPhosani ? EMonster.PHOSANI_NIGHTMARE : NightmareMonster.id;
		const monsterName = isPhosani ? "Phosani's Nightmare" : 'Nightmare';
		const team = method === 'solo' ? [user.id] : [user.id, '1', '2', '3'];

		const [userStats] = await getNightmareGearStats(user, team, isPhosani);
		const parsedUsers = team.map(id => ({ ...userStats, id }));
		const userLoot = new Bank();
		let kc = 0;
		let deaths = 0;

		for (let i = 0; i < quantity; i++) {
			const _loot = RawNightmare.kill({
				team: parsedUsers.map(user => ({
					id: user.id,
					damageDone: team.length === 1 ? 2400 : randomVariation(user.damageDone, 5)
				})),
				isPhosani
			});

			const died = percentChance(userStats.chanceOfDeath);
			if (died) {
				deaths++;
			} else {
				userLoot.add(_loot[user.id]);
				kc++;
			}
		}

		const xpRes = await user.addMonsterXP({
			monsterID: EMonster.NIGHTMARE,
			quantity: Math.ceil(quantity / team.length),
			duration,
			isOnTask: false,
			taskQuantity: null
		});

		const { newKC } = await user.incrementKC(monsterID, kc);
		const ownsOrUsedTablet =
			user.bank.has('Slepey tablet') ||
			(user.bitfield.includes(BitField.HasSlepeyTablet) && user.cl.has('Slepey Tablet'));
		if (isPhosani) {
			if (ownsOrUsedTablet) {
				userLoot.remove('Slepey tablet', userLoot.amount('Slepey tablet'));
			}
			if (!ownsOrUsedTablet && !userLoot.has('Slepey tablet')) {
				// const { newKC } = await user.incrementKC(monsterID, kc);
				if (newKC >= 25) {
					userLoot.add('Slepey tablet');
				}
			}
		}

		// Fix purple items on solo kills
		const { previousCL, itemsAdded } = await user.transactItems({ itemsToAdd: userLoot, collectionLog: true });

		announceLoot({
			user,
			monsterID,
			loot: itemsAdded,
			notifyDrops: NightmareMonster.notifyDrops
		});

		await trackLoot({
			totalLoot: itemsAdded,
			id: monsterName,
			type: 'Monster',
			changeType: 'loot',
			duration,
			kc: quantity,
			users: [
				{
					id: user.id,
					duration,
					loot: itemsAdded
				}
			]
		});

		if (!kc) {
			handleTripFinish(
				user,
				channelID,
				`${user}, ${user.minionName} died in all their attempts to kill the ${monsterName}, they apologize and promise to try harder next time.`,
				undefined,
				data,
				null
			);
		} else {
			const image = await makeBankImage({
				bank: itemsAdded,
				title: `${quantity}x Nightmare`,
				user,
				previousCL
			});

			const kc = await user.getKC(monsterID);
			const kcPerHour = (quantity / (duration / (1000 * 60 * 60))).toFixed(2);
			handleTripFinish(
				user,
				channelID,
				`${user}, ${user.minionName} finished killing ${quantity} ${monsterName} (${kcPerHour}/hr), you died ${deaths} times. Your ${monsterName} KC is now ${kc}. ${xpRes}`,
				image.file.attachment,
				data,
				itemsAdded
			);
		}
	}
};
