import { percentChance } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import { Pickpockable, Pickpocketables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export function calcLootXPPickpocketing(
	currentLevel: number,
	npc: Pickpockable,
	quantity: number
): [number, number, number, Bank] {
	let xpReceived = 0;

	const loot = new Bank();
	let successful = 0;
	let damageTaken = 0;
	// Pickpocketing takes 2 ticks
	const timeToPickpocket = 2 * 0.6;
	// For future Ardougne Diary and Thieving cape
	const diary = 1;
	const thievCape = 1;

	const chanceOfSuccess = (npc.slope * currentLevel + npc.intercept) * diary * thievCape;

	for (let i = 0; i < quantity; i++) {
		if (!percentChance(chanceOfSuccess)) {
			// The minion has just been stunned, and cant pickpocket for a few ticks, therefore
			// they also miss out on the next few pickpockets depending on stun time. And take damage
			damageTaken += npc.stunDamage;
			quantity -= Math.round(npc.stunTime / timeToPickpocket);
			continue;
		}
		successful++;
		loot.add(npc.table.roll());
		xpReceived += npc.xp;
	}

	return [successful, damageTaken, xpReceived, loot];
}

export default class extends Task {
	async run({ monsterID, quantity, userID, channelID, duration }: PickpocketActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const npc = Pickpocketables.find(_npc => _npc.id === monsterID);
		if (!npc) {
			this.client.wtf(new Error(`Missing pickpocket monster with ID ${monsterID}.`));
			return;
		}
		const currentLevel = user.skillLevel(SkillsEnum.Thieving);
		const [successful, xpReceived, damageTaken, loot] = calcLootXPPickpocketing(
			currentLevel,
			npc,
			quantity
		);

		if (user.id === '411025849966526470') {
			loot.add('Rocky');
		}
		await user.addItemsToBank(loot.values(), true);

		// Do something with damageTaken, text and remove food?
		console.log(damageTaken);
		await user.addXP(SkillsEnum.Mining, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Mining);

		let str = `${user}, ${user.minionName} finished pickpocketing a ${
			npc.name
		} ${successful}x times, due to failures you missed out on ${
			quantity - successful
		}x pickpockets, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Thieving level is now ${newLevel}!`;
		}
		str += `\n\nYou received: ${await createReadableItemListFromBank(
			this.client,
			loot.values()
		)}.`;

		if (loot.amount('Rocky') > 0) {
			str += `\n\n**You have a funny feeling you're being followed...**`;
		}
		// TODO ANNOUNCE ROCKY

		str += `\n**${((xpReceived / (duration / Time.Minute)) * 60).toLocaleString()} XP/Hr**`;

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of pickpocketing ${quantity}x ${npc.name}[${npc.id}]`);
			return this.client.commands.get('pickpocket')!.run(res, [quantity, npc.name]);
		});
	}
}
