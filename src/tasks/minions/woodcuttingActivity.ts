import { randInt, Time } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { Log, SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { perTimeUnitChance, roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import resolveItems from '../../lib/util/resolveItems';

let strForestry = '';
let fakeEvent = 0;

function handleForestry({ user, log, duration, loot }: { user: MUser; log: Log; duration: number; loot: Bank }) {
	if (resolveItems(['Redwood logs', 'Logs']).includes(log.id)) return;

	const strugglingSaplingTable = new LootTable()
		.add('Leaves', 20)
		.add('Oak Leaves', 20)
		.add('Willow Leaves', 20)
		.add('Maple Leaves', 20)
		.add('Yew Leaves', 20)
		.add('Magic Leaves', 20);

	perTimeUnitChance(duration, 20, Time.Minute, async () => {
		let itemsToAdd = undefined;
		let event = randInt(1, 9);

		// Only four out of nine events in-game give any items other than Anima-infused bark
		switch (event) {
			case 1: // Pheasant Control Forestry event
				loot.add('Pheasant tail feathers', randInt(12, 25));
				if (user.owns('Padded spoon')) {
					if (roll(10)) {
						loot.add('Golden pheasant egg', 1);
						strForestry +=
							' Completed the Pheasant Control Forestry event. You feel a connection to the pheasants as if one wishes to travel with you...';
					} else {
						strForestry += ' Completed the Pheasant Control Forestry event.';
					}
					await user.transactItems({ itemsToRemove: new Bank().add('Padded spoon', 1), itemsToAdd });
				} else {
					strForestry += ' Completed the Pheasant Control Forestry event.';
				}
				break;
			case 2: // Poachers Forestry event
				if (user.owns('Trap disarmer')) {
					if (roll(10)) {
						loot.add('Golden Fox whistle', 1);
						strForestry += ' Completed the Poachers Forestry event. The fox has left you a gift...';
					} else {
						strForestry += ' Completed the Poachers Forestry event.';
					}
					await user.transactItems({ itemsToRemove: new Bank().add('Trap disarmer', 1), itemsToAdd });
				} else {
					strForestry += ' Completed the Poachers Forestry event.';
				}
				break;
			case 3: // Enchantment Ritual Forestry event
				if (roll(10)) {
					loot.add('Petal garland', 1);
					strForestry +=
						'  Completed the Enchantment Ritual Forestry event. The Dryad has left you a gift...';
				} else {
					strForestry += ' Completed the Enchantment Ritual Forestry event.';
				}
				break;
			case 4: // Struggling Sapling Forestry Event
				strForestry += ' Completed the Struggling Sapling Forestry event.';
				loot.add(strugglingSaplingTable.roll());
				break;
			case 5:
				fakeEvent++;
				break;
			case 6:
				fakeEvent++;
				break;
			case 7:
				fakeEvent++;
				break;
			case 8:
				fakeEvent++;
				break;
			case 9:
				fakeEvent++;
				break;
		}

		// Give user Anima-infused bark
		loot.add('Anima-infused bark', randInt(500, 1000));
	});
	// Message for non-unique events
	if (strForestry === '' && loot.has('Anima-infused bark')) {
		strForestry += ' Completed some Forestry events.';
	} else if (fakeEvent > 0) {
		strForestry += ' Completed some other Forestry events.';
	}
}

export const woodcuttingTask: MinionTask = {
	type: 'Woodcutting',
	async run(data: WoodcuttingActivityTaskOptions) {
		const { logID, quantity, userID, channelID, duration, powerchopping } = data;
		const user = await mUserFetch(userID);
		const log = Woodcutting.Logs.find(i => i.id === logID)!;

		let strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
		let xpReceived = quantity * log.xp;
		let bonusXP = 0;
		let loot = new Bank();

		// If they have the entire lumberjack outfit, give an extra 0.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Woodcutting.lumberjackItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each lumberjack item, check if they have it, give its XP boost if so
			for (const [itemID, bonus] of Object.entries(Woodcutting.lumberjackItems)) {
				if (user.gear.skilling.hasEquipped([parseInt(itemID)], false)) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		// Give the user xp
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Woodcutting,
			amount: xpReceived,
			duration
		});

		// Add Logs or loot
		if (!powerchopping) {
			if (log.lootTable) {
				loot.add(log.lootTable.roll(quantity));
			} else {
				loot.add(log.id, quantity);
			}
		}

		// Add leaves
		if (log.leaf && user.hasEquippedOrInBank('Forestry kit')) {
			for (let i = 0; i < quantity; i++) {
				if (roll(4)) {
					loot.add(log.leaf, 1);
				}
			}
		}

		// Add clue scrolls
		if (log.clueScrollChance) {
			addSkillingClueToLoot(
				user,
				SkillsEnum.Woodcutting,
				quantity,
				log.clueScrollChance,
				loot,
				log.clueNestsOnly,
				strungRabbitFoot
			);
		}

		// Add Forestry events
		handleForestry({ user, log, duration, loot });

		// End of Trip message
		let str = `${user}, ${user.minionName} finished woodcutting. ${xpRes}`;
		if (bonusXP > 0) {
			str += `. **Bonus XP:** ${bonusXP.toLocaleString()}`;
		}
		if (strungRabbitFoot && !log.clueNestsOnly) {
			str += "\nYour strung rabbit foot necklace increases the chance of receiving bird's eggs and rings.";
		}
		str += `\n ${strForestry}`;

		// Roll for pet
		if (log.petChance) {
			const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Woodcutting, log.petChance);
			if (roll(petDropRate / quantity)) {
				loot.add('Beaver');
				str += "\n**You have a funny feeling you're being followed...**";
				globalClient.emit(
					Events.ServerNotification,
					`${Emoji.Woodcutting} **${user.badgedUsername}'s** minion, ${
						user.minionName
					}, just received a Beaver while cutting ${log.name} at level ${user.skillLevel(
						'woodcutting'
					)} Woodcutting!`
				);
			}
		}

		// Loot message
		str += `\nYou received ${loot}.`;

		// Give the user loot
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
