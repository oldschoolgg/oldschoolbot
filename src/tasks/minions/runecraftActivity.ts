import { Task } from 'klasa';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji, Events, Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/openables';
import { calcMaxRCQuantity } from '../../lib/skilling/functions/calcMaxRCQuantity';
import Runecraft, { RunecraftActivityTaskOptions } from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { addItemToBank, multiplyBank, roll } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

const LowRunes = new LootTable()
	.add('Air rune', [50, 100])
	.add('Mind rune', [50, 100])
	.add('Water rune', [50, 100])
	.add('Earth rune', [50, 100])
	.add('Fire rune', [50, 100])
	.add('Body rune', [50, 100])
	.add('Cosmic rune', [50, 100])
	.add('Chaos rune', [50, 100]);
const HighRuneTable = new LootTable()
	.add('Nature rune', [20, 50])
	.add('Law rune', [20, 50])
	.add('Death rune', [20, 50])
	.add('Blood rune', [20, 50])
	.add('Soul rune', [20, 50])
	.add('Wrath rune', [20, 50])
	.add('Astral rune', [20, 50]);

const RuneTable = new LootTable().add(LowRunes, 1, 3).add(HighRuneTable);

export default class extends Task {
	async run(data: RunecraftActivityTaskOptions) {
		const { runeID, essenceQuantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Runecraft);

		const rune = Runecraft.Runes.find(_rune => _rune.id === runeID);

		if (!rune) return;
		const quantityPerEssence = calcMaxRCQuantity(rune, user);
		const runeQuantity = essenceQuantity * quantityPerEssence;

		const xpReceived = essenceQuantity * rune.xp;

		await user.addXP(SkillsEnum.Runecraft, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Runecraft);

		let str = `${user}, ${user.minionName} finished crafting ${runeQuantity} ${
			rune.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Runecraft level is now ${newLevel}!`;
		}

		let loot = {
			[rune.id]: runeQuantity
		};

		if (roll(10)) {
			if (duration > Time.Minute * 10) {
				loot = multiplyBank(loot, 2);
				loot[getRandomMysteryBox()] = 1;
			}
		}

		const minutes = duration / Time.Minute;
		if (user.equippedPet() === itemID('Obis')) {
			let rolls = minutes / 3;
			for (let i = 0; i < rolls; i++) {
				let [res] = RuneTable.roll();
				loot = addItemToBank(loot, res.item, res.quantity);
			}
		}

		if (roll(1200) && !user.hasItemEquippedOrInBank('Obis')) {
			loot[itemID('Obis')] = 1;
		}

		if (roll((1_795_758 - user.skillLevel(SkillsEnum.Runecraft) * 25) / essenceQuantity)) {
			loot[itemID('Rift guardian')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Runecraft} **${user.username}'s** minion, ${user.minionName}, just received a Rift guardian while crafting ${rune.name}s at level ${currentLevel} Runecrafting!`
			);
		}

		str += `\n\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${runeQuantity}x ${rune.name}[${rune.id}]`);
				return this.client.commands.get('rc')!.run(res, [essenceQuantity, rune.name]);
			},
			undefined,
			data
		);
	}
}
