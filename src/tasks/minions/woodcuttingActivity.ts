import { percentChance, randInt, Time } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { MediumSeedPackTable } from '../../lib/data/seedPackTables';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import { eggNest } from '../../lib/simulation/birdsNest';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { Log, SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { perTimeUnitChance, roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import resolveItems from '../../lib/util/resolveItems';

async function handleForestry({ user, log, duration, loot }: { user: MUser; log: Log; duration: number; loot: Bank }) {
	if (resolveItems(['Redwood logs', 'Logs']).includes(log.id)) return '';

	let [case1, case2, case3, case4, case5, case6, case7, case8, case9, totalEvents, eggsDelivered] = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	];
	let strForestry = '';
	let defaultAmount = randInt(400, 600);
	let userWcLevel = user.skillLevel(SkillsEnum.Woodcutting);
	let wcMultiplier = userWcLevel / 100;
	let eggChance = Math.ceil(2700 - ((userWcLevel - 1) * (2700 - 1350)) / 98);
	let whistleChance = Math.ceil(90 - ((userWcLevel - 1) * (90 - 45)) / 98);

	const leafTable = new LootTable()
		.add('Leaves', 20)
		.add('Oak Leaves', 20)
		.add('Willow Leaves', 20)
		.add('Maple Leaves', 20)
		.add('Yew Leaves', 20)
		.add('Magic Leaves', 20);

	perTimeUnitChance(duration, 20, Time.Minute, async () => {
		let event = randInt(1, 9);

		// Forestry events
		switch (event) {
			case 1: // Rising Roots
				case1++;
				break;
			case 2: // Struggling Sapling
				case2++;
				loot.add(leafTable.roll());
				break;
			case 3: // Flowering Bush
				case3++;
				loot.add('Strange fruit', randInt(4, 8)).add(MediumSeedPackTable.roll());
				break;
			case 4: // Woodcutting Leprechaun
				case4++;
				break;
			case 5: // Beehive
				case5++;
				loot.add('Sturdy beehive parts', randInt(2, 6));
				break;
			case 6: // Friendly Ent
				case6++;
				loot.add(leafTable.roll());
				if (percentChance(95)) {
					loot.add(eggNest.roll());
				}
				break;
			case 7: // Poachers
				case7++;
				if (roll(whistleChance)) {
					loot.add('Fox whistle', 1);
				}
				break;
			case 8: // Enchantment Ritual
				case8++;
				if (roll(50)) {
					loot.add('Petal garland', 1);
				}
				break;
			case 9: // Pheasant Control
				case9++;
				eggsDelivered = randInt(15, 60);
				for (let i = 0; i < eggsDelivered; i++) {
					if (percentChance(50)) {
						loot.add('Pheasant tail feathers', 1);
					}
					if (roll(eggChance)) {
						loot.add('Golden pheasant egg', 1);
					}
					i++;
				}
				break;
		}
		// Give user Anima-infused bark
		loot.add('Anima-infused bark', randInt(500, 1000));
	});

	const events = [
		{ event: 'Rising Roots', value: case1, uniqueXP: undefined, amount: defaultAmount },
		{ event: 'Struggling Sapling', value: case2, uniqueXP: SkillsEnum.Farming, amount: defaultAmount },
		{ event: 'Flowering Bush', value: case3, uniqueXP: undefined, amount: defaultAmount },
		{ event: 'Woodcutting Leprechaun', value: case4, uniqueXP: undefined, amount: defaultAmount },
		{ event: 'Beehive', value: case5, uniqueXP: SkillsEnum.Construction, amount: defaultAmount },
		{ event: 'Friendly Ent', value: case6, uniqueXP: SkillsEnum.Fletching, amount: defaultAmount },
		{ event: 'Poachers', value: case7, uniqueXP: SkillsEnum.Hunter, amount: defaultAmount },
		{ event: 'Enchantment Ritual', value: case8, uniqueXP: undefined, amount: defaultAmount },
		{
			event: 'Pheasant Control',
			value: case9,
			uniqueXP: SkillsEnum.Thieving,
			amount: eggsDelivered * 100
		}
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
		if (eventObj.uniqueXP !== undefined) {
			xpRes += await user.addXP({
				skillName: eventObj.uniqueXP,
				amount: eventObj.value * eventObj.amount * wcMultiplier,
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
		loot.has('Sturdy beehive parts')
			? '- The temporary beehive was made so well you could repurpose parts of it to build a permanent hive.\n'
			: ''
	}`;
	strForestry += `${
		loot.has('Golden pheasant egg')
			? '- You feel a connection to the pheasants as if one wishes to travel with you...\n'
			: ''
	}`;
	strForestry += `${
		loot.has('Fox whistle') ? '- You feel a connection to the fox as if it wishes to travel with you...\n' : ''
	}`;
	strForestry += `${loot.has('Petal garland') ? '- The Dryad also hands you a Petal garland.\n' : ''}`;

	return strForestry;
}

export const woodcuttingTask: MinionTask = {
	type: 'Woodcutting',
	async run(data: WoodcuttingActivityTaskOptions) {
		const { logID, quantity, userID, channelID, duration, powerchopping, twitchers } = data;
		const user = await mUserFetch(userID);
		const log = Woodcutting.Logs.find(i => i.id === logID)!;
		const forestersRations = user.bank.amount("Forester's ration");

		let strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
		let itemsToRemove = new Bank();
		let xpReceived = quantity * log.xp;
		let bonusXP = 0;
		let rationUsed = 0;
		let lostLogs = 0;
		let loot = new Bank();

		// Felling axe +10% xp bonus & 20% logs lost
		if (user.gear.skilling.hasEquipped('Bronze felling axe') && !log.lootTable) {
			for (let i = 0; i < quantity && i < forestersRations; i++) {
				rationUsed++;
				if (roll(5)) {
					lostLogs++;
				}
			}
			const fellingXP = rationUsed * log.xp * 0.1;
			bonusXP += fellingXP;
			xpReceived += fellingXP;
			itemsToRemove.add("Forester's ration", rationUsed);
		}

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
				loot.add(log.id, quantity - lostLogs);
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
				strungRabbitFoot,
				twitchers
			);
		}

		// End of trip message
		let str = `${user}, ${user.minionName} finished woodcutting. ${xpRes}${
			bonusXP > 0 ? ` **Bonus XP:** ${bonusXP.toLocaleString()}` : ''
		}\n`;

		if (strungRabbitFoot && !log.clueNestsOnly) {
			str += "Your strung rabbit foot necklace increases the chance of receiving bird's eggs and rings.\n";
		}
		if (user.hasEquipped("twitcher's gloves") && !log.clueNestsOnly) {
			str += `Your twitcher's gloves increases the chance of receiving ${twitchers} nests.\n`;
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

		// Loot received, items used, and logs lost message
		str += `\nYou received ${loot}. `;
		str += `${itemsToRemove !== null ? `You used ${itemsToRemove}. ` : ''}`;
		str += `${lostLogs > 0 ? `You lost ${lostLogs}x ${log.name} due to using a felling axe.` : ''}`;

		// Update cl, give loot, and remove items used
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot,
			itemsToRemove
		});

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
