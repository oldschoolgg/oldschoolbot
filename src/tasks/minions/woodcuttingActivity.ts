import { percentChance, randInt, Time } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { Emoji, Events, TwitcherGloves } from '../../lib/constants';
import { MediumSeedPackTable } from '../../lib/data/seedPackTables';
import addSkillingClueToLoot from '../../lib/minions/functions/addSkillingClueToLoot';
import { eggNest } from '../../lib/simulation/birdsNest';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { perTimeUnitChance, roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { userStatsBankUpdate } from '../../mahoji/mahojiSettings';

interface ForestryEvent {
	id: number;
	name: string;
	uniqueXP: SkillsEnum;
}

const ForestryEvents: ForestryEvent[] = [
	{
		id: 1,
		name: 'Rising Roots',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 2,
		name: 'Struggling Sapling',
		uniqueXP: SkillsEnum.Farming
	},
	{
		id: 3,
		name: 'Flowering Bush',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 4,
		name: 'Woodcutting Leprechaun',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 5,
		name: 'Beehive',
		uniqueXP: SkillsEnum.Construction
	},
	{
		id: 6,
		name: 'Friendly Ent',
		uniqueXP: SkillsEnum.Fletching
	},
	{
		id: 7,
		name: 'Poachers',
		uniqueXP: SkillsEnum.Hunter
	},
	{
		id: 8,
		name: 'Enchantment Ritual',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 9,
		name: 'Pheasant Control',
		uniqueXP: SkillsEnum.Thieving
	}
];

const LeafTable = new LootTable()
	.add('Leaves', 20)
	.add('Oak leaves', 20)
	.add('Willow leaves', 20)
	.add('Maple leaves', 20)
	.add('Yew leaves', 20)
	.add('Magic leaves', 20);

async function handleForestry({ user, duration, loot }: { user: MUser; duration: number; loot: Bank }) {
	let eventCounts: { [key: number]: number } = {};
	let eventXP = {} as { [key in SkillsEnum]: number };
	ForestryEvents.forEach(event => {
		eventCounts[event.id] = 0;
		eventXP[event.uniqueXP] = 0;
	});

	let strForestry = '';
	const userWcLevel = user.skillLevel(SkillsEnum.Woodcutting);
	const chanceWcLevel = Math.min(userWcLevel, 99);
	const eggChance = Math.ceil(2700 - ((chanceWcLevel - 1) * (2700 - 1350)) / 98);
	const whistleChance = Math.ceil(90 - ((chanceWcLevel - 1) * (90 - 45)) / 98);

	perTimeUnitChance(duration, 20, Time.Minute, async () => {
		const eventIndex = randInt(0, ForestryEvents.length - 1);
		const event = ForestryEvents[eventIndex];
		const defaultEventXP = 5 * (randInt(85, 115) / 100); // used for unverified xp rates
		let eggsDelivered = 0;

		switch (event.id) {
			case 1: // Rising Roots
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += user.skillLevel(event.uniqueXP) * defaultEventXP;
				break;
			case 2: // Struggling Sapling
				loot.add(LeafTable.roll());
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += user.skillLevel(event.uniqueXP) * defaultEventXP;
				break;
			case 3: // Flowering Bush
				loot.add('Strange fruit', randInt(4, 8)).add(MediumSeedPackTable.roll());
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += user.skillLevel(event.uniqueXP) * defaultEventXP;
				break;
			case 4: // Woodcutting Leprechaun
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += user.skillLevel(event.uniqueXP) * defaultEventXP;
				break;
			case 5: // Beehive
				for (let i = 0; i < randInt(4, 6); i++) {
					if (percentChance(200 / 300)) {
						loot.add('Sturdy beehive parts');
					}
				}
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += user.skillLevel(event.uniqueXP) * defaultEventXP;
				break;
			case 6: // Friendly Ent
				loot.add(LeafTable.roll());
				loot.add(eggNest.roll());
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += user.skillLevel(event.uniqueXP) * defaultEventXP;
				break;
			case 7: // Poachers
				if (roll(whistleChance)) {
					loot.add('Fox whistle');
				}
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += user.skillLevel(event.uniqueXP) * defaultEventXP;
				break;
			case 8: // Enchantment Ritual
				if (roll(50)) {
					loot.add('Petal garland');
				}
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += user.skillLevel(event.uniqueXP) * defaultEventXP;
				break;
			case 9: // Pheasant Control
				eggsDelivered = randInt(15, 45);
				for (let i = 0; i < eggsDelivered; i++) {
					if (percentChance(50)) {
						loot.add('Pheasant tail feathers');
					}
					if (roll(eggChance)) {
						loot.add('Golden pheasant egg');
					}
				}
				eventCounts[event.id]++;
				eventXP[event.uniqueXP] += eggsDelivered * Math.ceil(user.skillLevel(SkillsEnum.Thieving) / 2);
				break;
		}
		// Give user Anima-infused bark per event
		loot.add('Anima-infused bark', randInt(500, 1000));
	});

	let totalEvents = 0;
	for (const event in eventCounts) {
		if (eventCounts.hasOwnProperty(event)) {
			const count = eventCounts[event];
			totalEvents += count;
			await userStatsBankUpdate(
				user.id,
				'forestry_event_completions_bank',
				new Bank().add(parseInt(event), count)
			);
		}
	}

	// Give user woodcutting xp for each event completed
	for (let i = 0; i < totalEvents; i++) {
		eventXP[SkillsEnum.Woodcutting] += randInt(500, 800) * (userWcLevel / 99);
	}

	// Give user xp from events
	let xpRes = '';
	for (const skill in eventXP) {
		if (eventXP.hasOwnProperty(skill)) {
			xpRes += await user.addXP({
				skillName: skill as SkillsEnum,
				amount: Math.ceil(eventXP[skill as SkillsEnum]),
				minimal: true,
				source: 'ForestryEvents'
			});
		}
	}

	// Generate forestry message
	const completedEvents = Object.entries(eventCounts)
		.map(([eventId, count]) => {
			const event = ForestryEvents.find(e => e.id === parseInt(eventId));
			return count > 0 ? `${count} ${event!.name}` : null;
		})
		.filter(Boolean)
		.join(' & ');
	strForestry += `${
		totalEvents > 0 ? `Completed Forestry event${totalEvents > 1 ? 's:' : ':'} ${completedEvents}. ${xpRes}\n` : ''
	}`;
	strForestry += `${
		loot.has('Sturdy beehive parts') && !user.cl.has('Sturdy beehive parts') // only show this message once to reduce spam
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
		const { logID, quantity, userID, channelID, duration, powerchopping, forestry, twitchers } = data;
		const user = await mUserFetch(userID);
		let userWcLevel = user.skillLevel(SkillsEnum.Woodcutting);
		const log = Woodcutting.Logs.find(i => i.id === logID)!;
		const forestersRations = user.bank.amount("Forester's ration");
		const wcCapeNestBoost =
			user.hasEquipped('Woodcutting cape') ||
			(user.hasEquipped('Forestry basket') &&
				user.bank.has(['Woodcutting cape', 'Cape pouch']) &&
				userWcLevel >= 99);

		let strungRabbitFoot = user.hasEquipped('Strung rabbit foot');
		let twitchersEquipped = user.hasEquipped("twitcher's gloves");
		let twitcherSetting = undefined;
		let xpReceived = quantity * log.xp;
		let bonusXP = 0;
		let rationUsed = 0;
		let lostLogs = 0;
		let loot = new Bank();
		let itemsToRemove = new Bank();

		// Felling axe +10% xp bonus & 20% logs lost
		if (user.gear.skilling.hasEquipped('Bronze felling axe')) {
			for (let i = 0; i < quantity && i < forestersRations; i++) {
				rationUsed++;
				if (percentChance(20)) {
					lostLogs++;
				}
			}
			const fellingXP = Math.floor(rationUsed * log.xp * 0.1);
			xpReceived += fellingXP;
			bonusXP += fellingXP;
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
			amount: Math.ceil(xpReceived),
			duration
		});

		// Add Logs or loot
		if (!powerchopping) {
			if (log.lootTable) {
				loot.add(log.lootTable.roll(quantity - lostLogs));
			} else {
				loot.add(log.id, quantity - lostLogs);
			}
		}

		// Add leaves
		if (log.leaf && user.hasEquippedOrInBank('Forestry kit')) {
			for (let i = 0; i < quantity; i++) {
				if (percentChance(25)) {
					loot.add(log.leaf, 1);
				}
			}
		}

		// Check for twitcher gloves
		if (twitchersEquipped) {
			twitcherSetting = twitchers;
		}

		// Add clue scrolls & nests
		if (log.clueScrollChance) {
			addSkillingClueToLoot(
				user,
				SkillsEnum.Woodcutting,
				quantity,
				log.clueScrollChance,
				loot,
				log.clueNestsOnly,
				strungRabbitFoot,
				twitcherSetting,
				wcCapeNestBoost
			);
		}

		// End of trip message
		let str = `${user}, ${user.minionName} finished woodcutting. ${xpRes}${
			bonusXP > 0 ? ` **Bonus XP:** ${bonusXP.toLocaleString()}` : ''
		}\n`;

		if (!log.clueNestsOnly) {
			if (wcCapeNestBoost) {
				str += `Your ${
					user.hasEquipped('Woodcutting cape') ? 'Woodcutting cape' : 'Forestry basket'
				} increases the chance of receiving bird nests.\n`;
			}
			if (strungRabbitFoot) {
				str +=
					'Your Strung rabbit foot necklace increases the chance of receiving bird egg nests and ring nests.\n';
			}
			if (twitcherSetting !== undefined) {
				str += `Your Twitcher's gloves increases the chance of receiving ${twitcherSetting} nests.\n`;
			}
		}

		// Forestry events
		if (forestry) {
			str += await handleForestry({ user, duration, loot });
		}

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

		// Loot received, items used, and logs/loot rolls lost message
		str += `\nYou received ${loot}. `;
		str += `${itemsToRemove.length > 0 ? `You used ${itemsToRemove}. ` : ''}`;
		str += `${
			lostLogs > 0 && !powerchopping
				? `You lost ${
						log.lootTable ? `${lostLogs}x ${log.name} loot rolls` : `${lostLogs}x ${log.name}`
				  } due to using a felling axe.`
				: ''
		}`;

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
