import { randArrItem, Time } from 'e';
import { Task } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';

import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { KillableMonster } from '../../lib/minions/types';
import { allKeyPieces } from '../../lib/nex';
import { setActivityLoot } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { bones } from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { ActivityTable } from '../../lib/typeorm/ActivityTable.entity';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable, itemID, rand, roll } from '../../lib/util';
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

		await user.incrementMonsterScore(monsterID, quantity);

		// Abyssal set bonuses -- grants the user a few extra kills
		let abyssalBonus = 1;
		if (user.equippedPet() === itemID('Ori')) {
			abyssalBonus += 0.25;
		}

		const preExistingLoot = (await ActivityTable.findOne({ id }))?.loot;

		let loot = preExistingLoot
			? new Bank(preExistingLoot)
			: new Bank((monster as any).table.kill(Math.ceil(quantity * abyssalBonus)));
		if ([3129, 2205, 2215, 3162].includes(monster.id)) {
			for (let i = 0; i < quantity; i++) {
				if (roll(20)) {
					loot.add(randArrItem(allKeyPieces));
				}
			}
		}

		if (monster.id === Monsters.Vorkath.id && roll(6000)) {
			loot.add(23941);
		}

		let gotKlik = false;
		const minutes = Math.ceil(duration / Time.Minute);
		if (fullMonster?.data.attributes.includes(MonsterAttribute.Dragon)) {
			for (let i = 0; i < minutes; i++) {
				if (roll(7500)) {
					gotKlik = true;
					loot.add('Klik');
					break;
				}
			}
		}

		let bananas = 0;
		if (user.equippedPet() === itemID('Harry')) {
			for (let i = 0; i < minutes; i++) {
				bananas += rand(1, 3);
			}
			loot.add('Banana', bananas);
		}

		if (monster.id === 290) {
			for (let i = 0; i < minutes; i++) {
				if (roll(6000)) {
					loot.add('Dwarven ore');
					break;
				}
			}
		}

		let gotBrock = false;
		if (monster.name.toLowerCase() === 'zulrah') {
			for (let i = 0; i < minutes; i++) {
				if (roll(5500)) {
					gotBrock = true;
					loot.add('Brock');
					break;
				}
			}
		}

		if (loot) {
			setActivityLoot(id, loot.bank);
		}
		announceLoot(this.client, user, monster as KillableMonster, loot.bank);

		const xpRes = await addMonsterXP(user, monsterID, quantity, duration);

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${
			monster.name
		} KC is now ${user.getKC(monsterID)}.\n${xpRes.join(', ')}.`;

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

		if (user.settings.get(UserSettings.Bank)[itemID('Gorajan bonecrusher')]) {
			let totalXP = 0;
			for (const bone of bones) {
				const amount = loot.amount(bone.inputId);
				if (amount > 0) {
					totalXP += bone.xp * amount * 4;
					loot.remove(bone.inputId, amount);
				}
			}
			str += await user.addXP(SkillsEnum.Prayer, totalXP, duration);
		}

		const { previousCL } = await user.addItemsToBank(loot, true);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From ${quantity} ${monster.name}:`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of killing ${monster.name}`);
				return this.client.commands.get('k')!.run(res, [quantity, monster.name]);
			},
			image!,
			data,
			loot.bank
		);
	}
}
