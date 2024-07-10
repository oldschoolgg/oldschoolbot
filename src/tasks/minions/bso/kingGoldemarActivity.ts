import { percentChance, randArrItem } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { trackLoot } from '../../../lib/lootTrack';
import KingGoldemar, {
	KingGoldemarLootTable
} from '../../../lib/minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { addMonsterXP } from '../../../lib/minions/functions';

import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { calcDwwhChance } from '../../../lib/structures/Boss';
import type { NewBossOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

const methodsOfDeath = [
	'Beheaded',
	'Skull shattered by Dwarven warhammer',
	'Fatal headbutt from the King',
	'Fell over and neck crushed',
	'Succumbed to blood loss from small wound',
	'Skull broken by a punch',
	'Stabbed in neck',
	'Fell into a lava fountain'
];

export const kingGoldemarTask: MinionTask = {
	type: 'KingGoldemar',
	async run(data: NewBossOptions) {
		const { channelID, users: idArr, duration, bossUsers } = data;
		const deaths: MUser[] = [];
		const users: MUser[] = await Promise.all(idArr.map(i => mUserFetch(i)));
		const solo = users.length < 2;

		const getUser = (id: string) => users.find(u => u.id === id)!;
		const dwwhTable: MUser[] = [];

		for (const { user, deathChance } of bossUsers) {
			if (percentChance(deathChance)) {
				deaths.push(getUser(user));
			} else {
				dwwhTable.push(getUser(user));
			}
		}

		const tagAll = users.map(u => u.toString()).join(', ');
		if (deaths.length === idArr.length) {
			if (solo) {
				return handleTripFinish(
					users[0],
					channelID,
					`${tagAll}\n\nYou were crushed by King Goldemar, you never stood a chance.`,
					undefined,
					data,
					null
				);
			}
			return handleTripFinish(
				users[0],
				channelID,
				`${tagAll}\n\n${'Your team was'} crushed by King Goldemar, you never stood a chance.`,
				undefined,
				data,
				null
			);
		}

		await Promise.all(users.map(u => u.incrementKC(KingGoldemar.id, 1)));

		const dwwhChance = calcDwwhChance(users);

		const gotDWWH = roll(dwwhChance);
		const dwwhRecipient = gotDWWH ? randArrItem(dwwhTable) : null;

		const killStr =
			gotDWWH && dwwhRecipient
				? `${
						dwwhRecipient?.usernameOrMention
					} delivers a crushing blow to King Goldemars warhammer, breaking it. The king has no choice but to flee the chambers, **leaving behind his broken hammer.**`
				: `${
						solo ? 'You' : 'Your team'
					} brought King Goldemar to a very weak state, he fled the chambers before he could be killed and escaped through a secret exit, promising to get revenge on you.`;

		let resultStr = `${tagAll}\n\n${killStr}\n\n${Emoji.Casket} **Loot:**`;

		if (gotDWWH && dwwhRecipient) {
			globalClient.emit(
				Events.ServerNotification,
				`**${dwwhRecipient?.usernameOrMention}** just received a **Broken dwarven warhammer** in a team of ${users.length}!`
			);
		}

		const teamLoot = new TeamLoot([]);
		const totalLoot = new Bank();
		for (const user of users.filter(u => !deaths.includes(u))) {
			const loot = new Bank().add(KingGoldemarLootTable.roll());
			if (dwwhRecipient === user) {
				loot.add('Broken dwarven warhammer');
			}
			if (isDoubleLootActive(duration)) {
				loot.multiply(2);
			}
			totalLoot.add(loot);
			await addMonsterXP(user, {
				monsterID: KingGoldemar.id,
				quantity: 1,
				duration,
				isOnTask: false,
				taskQuantity: null
			});
			await user.addItemsToBank({ items: loot, collectionLog: true });
			teamLoot.add(user.id, loot);

			const fakeLoot = loot.clone();

			resultStr += `\n${user} received ${fakeLoot}.`;
		}
		updateBankSetting('kg_loot', totalLoot);

		await trackLoot({
			duration,
			totalLoot,
			type: 'Monster',
			changeType: 'loot',
			id: KingGoldemar.name,
			kc: 1,
			users: users.map(i => ({
				id: i.id,
				loot: teamLoot.get(i.id),
				duration
			}))
		});

		// Show deaths in the result
		if (deaths.length > 0) {
			resultStr += `\n\n**Died in battle**: ${deaths.map(
				u => `${u.toString()}(${randArrItem(methodsOfDeath)})`
			)}.`;
		}

		if (!solo) {
			handleTripFinish(users[0], channelID, resultStr, undefined, data, null);
		} else {
			handleTripFinish(users[0], channelID, resultStr, undefined, data, totalLoot);
		}
	}
};
