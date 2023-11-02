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

async function handleForestry({ user, log, duration, loot }: { user: MUser; log: Log; duration: number; loot: Bank }) {
	if (resolveItems(['Redwood logs', 'Logs']).includes(log.id)) return;
	let [case1, case2, case3, case4, case5, case6, case7, case8, case9, totalEvents] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let strForestry = '';
	let wcMultiplier = user.skillLevel(SkillsEnum.Woodcutting) / 100;
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

		// Forestry events
		switch (event) {
			case 1: // Rising Roots event
				case1++;
				break;
			case 2: // Struggling Sapling event
				case2++;
				loot.add(strugglingSaplingTable.roll());
				break;
			case 3: // Flowering Bush
				case3++;
				break;
			case 4: // Woodcutting Leprechaun
				case4++;
				break;
			case 5: // Bee Hive
				case5++;
				break;
			case 6: // Friendly Ent
				case6++;
				break;
			case 7: // Poachers Forestry event
				case7++;
				if (user.owns('Trap disarmer')) {
					if (roll(20)) {
						loot.add('Fox whistle', 1);
					}
					await user.transactItems({ itemsToRemove: new Bank().add('Trap disarmer', 1), itemsToAdd });
				}
				break;
			case 8: // Enchantment Ritual Forestry event
				case8++;
				if (roll(20)) {
					loot.add('Petal garland', 1);
				}
				break;
			case 9: // Pheasant Control Forestry event
				case9++;
				loot.add('Pheasant tail feathers', randInt(12, 45));
				if (user.owns('Padded spoon')) {
					if (roll(20)) {
						loot.add('Golden pheasant egg', 1);
					}
					await user.transactItems({ itemsToRemove: new Bank().add('Padded spoon', 1), itemsToAdd });
				}
				break;
		}
		// Give user Anima-infused bark
		loot.add('Anima-infused bark', randInt(500, 1000));
	});

	const events = [
		{ event: 'Rising Roots', value: case1, uniqueXP: undefined },
		{ event: 'Struggling Sapling', value: case2, uniqueXP: SkillsEnum.Farming },
		{ event: 'Flowering Bush', value: case3, uniqueXP: undefined },
		{ event: 'Woodcutting Leprechaun', value: case4, uniqueXP: undefined },
		{ event: 'Bee Hive', value: case5, uniqueXP: SkillsEnum.Construction },
		{ event: 'Friendly Ent', value: case6, uniqueXP: SkillsEnum.Fletching },
		{ event: 'Poachers', value: case7, uniqueXP: SkillsEnum.Hunter },
		{ event: 'Enchantment Ritual', value: case8, uniqueXP: undefined },
		{ event: 'Pheasant Control', value: case9, uniqueXP: SkillsEnum.Thieving }
	];
	events.forEach(eventObj => (totalEvents += eventObj.value));

	// Give user woodcutting xp for each event completed
	let xpRes = await user.addXP({
		skillName: SkillsEnum.Woodcutting,
		amount: totalEvents * randInt(1800, 2000) * wcMultiplier
	});
	xpRes += ' ';

	// Give user unique xp per event
	for (const eventObj of events) {
		let defaultAmount = eventObj.value * randInt(300, 600) * wcMultiplier;
		if (eventObj.uniqueXP !== undefined) {
			if (eventObj.event === 'Pheasant Control') {
				// Pheasant Control gives 3 times the unique xp compared to other events
				defaultAmount *= 3;
			}
			xpRes += await user.addXP({
				skillName: eventObj.uniqueXP,
				amount: defaultAmount,
				minimal: true
			});
		}
	}

	// Generate forestry message
	const eventCounts = events
		.filter(eventObj => eventObj.value > 0)
		.map(eventObj => `${eventObj.value} ${eventObj.event}`);
	const completedEvents = eventCounts.join(' & ');
	strForestry += `${
		completedEvents.length > 0
			? `Completed Forestry event${totalEvents > 1 ? 's:' : ':'} ${completedEvents}. ${xpRes}\n`
			: ''
	}`;
	strForestry += `${
		loot.has('Golden pheasant egg')
			? '- You feel a connection to the pheasants as if one wishes to travel with you...\n'
			: ''
	}`;
	strForestry += `${
		loot.has('Golden Fox whistle')
			? '- You feel a connection to the fox as if it wishes to travel with you...\n'
			: ''
	}`;
	strForestry += `${loot.has('Petal garland') ? '- The Dryad has left you a gift...\n' : ''}`;

	return strForestry;
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

		// End of trip message
		let str = `${user}, ${user.minionName} finished woodcutting. ${xpRes}`;
		if (bonusXP > 0) {
			str += `. **Bonus XP:** ${bonusXP.toLocaleString()}\n`;
		}
		if (strungRabbitFoot && !log.clueNestsOnly) {
			str += "Your strung rabbit foot necklace increases the chance of receiving bird's eggs and rings.\n";
		}

		// Forestry events
		str += await handleForestry({ user, log, duration, loot });

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

		void handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
