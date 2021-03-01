import { randArrItem } from 'e';
import { Task } from 'klasa';
import { Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import { Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { KillableMonster } from '../../lib/minions/types';
import { allKeyPieces } from '../../lib/nex';
import { setActivityLoot } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { itemID, multiplyBank, rand, roll } from '../../lib/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MonsterActivityTaskOptions) {
		const { id, monsterID, userID, channelID, quantity, duration } = data;
		const monster = effectiveMonsters.find(mon => mon.id === monsterID)!;
		const fullMonster = Monsters.get(monsterID);
		const user = await this.client.users.fetch(userID);
		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;
		if (monster.name === 'Koschei the deathless' && !roll(5000)) {
			return channel.send(`${user.minionName} failed to defeat Koschei the deathless.`);
		}

		user.incrementMinionDailyDuration(duration);
		user.incrementMonsterScore(monsterID, quantity);

		// Abyssal set bonuses -- grants the user a few extra kills
		let abyssalBonus = 1;
		if (user.equippedPet() === itemID('Ori')) {
			abyssalBonus += 0.25;
		}

		let loot = (monster as any).table.kill(Math.ceil(quantity * abyssalBonus));
		if ([3129, 2205, 2215, 3162].includes(monster.id)) {
			for (let i = 0; i < quantity; i++) {
				if (roll(20)) {
					loot[randArrItem(allKeyPieces)] = 1;
				}
			}
		}

		if (duration > Time.Minute * 20 && roll(10)) {
			loot = multiplyBank(loot, 2);
			loot[getRandomMysteryBox()] = 1;
		}

		if (monster.id === Monsters.Vorkath.id && roll(4000)) {
			loot[23941] = 1;
		}

		let gotKlik = false;
		const minutes = Math.ceil(duration / Time.Minute);
		if (fullMonster?.data.attributes.includes(MonsterAttribute.Dragon)) {
			for (let i = 0; i < minutes; i++) {
				if (roll(7500)) {
					gotKlik = true;
					loot[itemID('Klik')] = 1;
					break;
				}
			}
		}

		let bananas = 0;
		if (user.equippedPet() === itemID('Harry')) {
			for (let i = 0; i < minutes; i++) {
				bananas += rand(1, 3);
			}
			loot[itemID('Banana')] = bananas;
		}

		if (monster.id === 290) {
			for (let i = 0; i < minutes; i++) {
				if (roll(6000)) {
					loot[itemID('Dwarven ore')] = 1;
					break;
				}
			}
		}

		let gotBrock = false;
		if (monster.name.toLowerCase() === 'zulrah') {
			for (let i = 0; i < minutes; i++) {
				if (roll(5500)) {
					gotBrock = true;
					loot[itemID('Brock')] = 1;
					break;
				}
			}
		}

		if (loot) {
			setActivityLoot(id, loot);
		}
		announceLoot(this.client, user, monster as KillableMonster, quantity, loot);

		await user.addItemsToBank(loot, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{ showNewCL: 1 },
				user
			);

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${
			(user.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0) + quantity
		}.`;

		if (gotBrock) {
			str += `\n<:brock:787310793183854594> On the way to Zulrah, you found a Badger that wants to join you.`;
		}

		if (gotKlik) {
			str += `\n\n<:klik:749945070932721676> A small fairy dragon appears! Klik joins you on your adventures.`;
		}

		if (bananas > 0) {
			str += `\n\n<:harry:749945071104819292> While you were PvMing, Harry went off and picked ${bananas} Bananas for you!`;
		}

		if (abyssalBonus > 1) {
			str += `\n\nOri has used the abyss to transmute you +25% bonus loot!`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of killing ${monster.name}`);
				return this.client.commands.get('k')!.run(res, [quantity, monster.name]);
			},
			image,
			data,
			loot
		);
	}
}
