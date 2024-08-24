import { percentChance } from 'e';
import { Bank, Misc } from 'oldschooljs';

import { BitField, NIGHTMARE_ID, PHOSANI_NIGHTMARE_ID } from '../../../lib/constants';
import { trackLoot } from '../../../lib/lootTrack';
import { NightmareMonster } from '../../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import type { NightmareActivityTaskOptions } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import { getNightmareGearStats } from '../../../lib/util/getNightmareGearStats';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

const RawNightmare = Misc.Nightmare;

export const nightmareTask: MinionTask = {
	type: 'Nightmare',
	async run(data: NightmareActivityTaskOptions) {
		const { channelID, quantity, duration, isPhosani = false, userID, method } = data;

		const monsterID = isPhosani ? PHOSANI_NIGHTMARE_ID : NightmareMonster.id;
		const monsterName = isPhosani ? "Phosani's Nightmare" : 'Nightmare';
		const user = await mUserFetch(userID);
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

		const xpRes = await addMonsterXP(user, {
			monsterID: NIGHTMARE_ID,
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
			if (!ownsOrUsedTablet && kc > 0 && newKC >= 100 && !userLoot.has('Slepey tablet')) {
				userLoot.add('Slepey tablet');
			}
		}

		// Fix purple items on solo kills
		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: userLoot, collectionLog: true });

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
			handleTripFinish(
				user,
				channelID,
				`${user}, ${user.minionName} finished killing ${quantity} ${monsterName}, you died ${deaths} times. Your ${monsterName} KC is now ${kc}. ${xpRes}`,
				image.file.attachment,
				data,
				itemsAdded
			);
		}
	}
};
