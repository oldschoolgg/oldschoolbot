import { Task } from 'klasa';
import { removeBankFromBank } from 'oldschooljs/dist/util';

import { Emoji, Events } from '../../lib/constants';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { Bank } from '../../lib/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { randFloat, roll } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run({ logID, quantity, userID, channelID, duration }: WoodcuttingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Woodcutting);

		const Log = Woodcutting.Logs.find(Log => Log.id === logID);

		if (!Log) return;

		const xpReceived = quantity * Log.xp;

		await user.addXP(SkillsEnum.Woodcutting, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Woodcutting);

		let str = `${user}, ${user.minionName} finished Woodcutting ${quantity} ${
			Log.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Woodcutting level is now ${newLevel}!`;
		}

		const loot = {
			[Log.id]: quantity
		};

		// Add clue scrolls
		// https://oldschool.runescape.wiki/w/Clue_bottle
		if (Log.clueScrollChance) {
			const clues: Record<number, number> = {
				[itemID('Clue scroll(easy)')]: 4 / 10,
				[itemID('Clue scroll(medium)')]: 3 / 10,
				[itemID('Clue scroll(hard)')]: 2 / 10,
				[itemID('Clue scroll(elite)')]: 1 / 10,
				[itemID('Clue scroll(beginner)')]: 1 / 1000
			};
			for (let i = 0; i < quantity; i++) {
				if (
					roll(
						Math.floor(
							Log.clueScrollChance / (100 + user.skillLevel(SkillsEnum.Woodcutting))
						)
					)
				) {
					for (const clue of Object.entries(clues)) {
						if (randFloat(0, 1) <= clue[1]) {
							loot[Number(clue[0])] = (loot[Number(clue[0])] ?? 0) + 1;
							break;
						}
					}
				}
			}
		}

		// roll for pet
		if (
			Log.petChance &&
			roll((Log.petChance - user.skillLevel(SkillsEnum.Woodcutting) * 25) / quantity)
		) {
			loot[itemID('Beaver')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Woodcutting} **${user.username}'s** minion, ${user.minionName}, just received a Beaver while cutting ${Log.name} at level ${currentLevel} Woodcutting!`
			);
		}

		str += `\n\nYou received: ___ITEMSRECEIVED___.`;

		// Show only what is added to the bank, to avoid showing multiple of the same clue scroll
		const addResult = Object.values(await user.addItemsToBank(loot, true));
		const bankPrevious = addResult[0].previous as Bank;
		const bankAfter = addResult[0].next as Bank;
		str = str.replace(
			'___ITEMSRECEIVED___',
			await createReadableItemListFromBank(
				this.client,
				removeBankFromBank(bankAfter, bankPrevious)
			)
		);

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of ${quantity}x ${Log.name}[${Log.id}]`);
			return this.client.commands.get('chop')!.run(res, [quantity, Log.name]);
		});
	}
}
