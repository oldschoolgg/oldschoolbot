import { Bank, Monsters } from 'oldschooljs';

import { convertStoredActivityToFlatActivity, prisma } from './settings/prisma';
import { getUsersCurrentSlayerInfo } from './slayer/slayerUtil';
import { ActivityTaskData } from './types/minions';
import getOSItem from './util/getOSItem';
import itemID from './util/itemID';
import resolveItems from './util/resolveItems';

/**
 * 1. Get Mysterious clue(1) from mysterious stranger
 * 2. Go do first step at cows, get dungsoaked msg
 * 3. do the clues
 * 4. final clue
 *
 *
 *  quest boss
 *
 * skippers wife is luring you to snow area to kill the yeti and save its child.
 *
 * hunter based
 * yeti is hunter boss
 * yeti boss at the end, defeated to get the pet/reward
 *
 */

const firstStep = {
	hint: `In Lumbridge's dawn, where bovine graze,
Lay one to rest in the morning haze,
In its yield, your path will blaze.`,
	didPass: (data: ActivityTaskData) =>
		data.type === 'MonsterKilling' && data.monsterID === Monsters.Cow.id && data.quantity === 1
};

const finalStep = {
	hint: "The hunters' trail is hot, the hunteds' trail is cold, in the whisper of the snow, the finale will unfold.",
	didPass: async (data: ActivityTaskData) => {
		if (
			data.type === 'Hunter' &&
			[
				'Polar kebbit',
				'Cerulean twitch',
				'Sapphire glacialis',
				'Snowy knight',
				'Sabre-toothed kebbit',
				'Sabre-toothed kyatt'
			].includes(data.creatureName)
		) {
			return true;
		}
		return false;
	}
};

export const mysteriousStepData = {
	1: {
		clueItem: getOSItem('Dungsoaked message'),
		loot: new Bank().add('Dungsoaked message').freeze(),
		messages: [
			'{minion} feels adventurous, and wants to go on this quest.',
			'{minion} is filled with excitement and anticipation for the journey ahead.',
			"{minion} can't wait to embark on this new adventure, feeling invigorated."
		]
	},
	2: {
		clueItem: getOSItem('Mysterious clue (2)'),
		loot: new Bank().add('Bloodsoaked cowhide').add('Mysterious clue (2)').freeze(),
		messages: [
			'{minion} is steadfast in continuing to solve this mystery.',
			'{minion} is committed and focused on the task at hand.',
			'{minion} remains determined, no challenge will deter him.'
		]
	},
	3: {
		clueItem: getOSItem('Mysterious clue (3)'),
		loot: new Bank().add('Bloodsoaked fur').add('Mysterious clue (3)').freeze(),
		messages: ['{minion} is enjoying the treasure trail.']
	},
	4: {
		clueItem: getOSItem('Mysterious clue (4)'),
		loot: new Bank().add("Bloodsoaked children's book").add('Mysterious clue (4)').freeze(),
		messages: [
			"{minion} feels uneasy about this quest and its' purpose.",
			'{minion} starts to doubt the path, sensing a growing unease.',
			"{minion} can't shake off the growing apprehension about the quest."
		]
	},
	5: {
		clueItem: getOSItem('Mysterious clue (5)'),
		loot: new Bank().add('Torn fur').add('Mysterious clue (5)').freeze(),
		messages: [
			"{minion} feels a chill creeping over him, something isn't right. Time is running out.",
			"{minion}'s confidence wanes, a cold realization that something is amiss. Time is running out.",
			'{minion} feels increasingly uncomfortable, danger seems near. Time is running out.'
		]
	},
	6: {
		clueItem: getOSItem('Mysterious clue (6)'),
		loot: new Bank().add('Mysterious clue (6)').freeze(),
		messages: [
			"{minion} feels uneasy, cold, and almost as if they're being watched.",
			'{minion} is on edge, fear grows with every step.',
			"{minion}'s nerves are frayed, sensing that they are not alone."
		]
	},
	7: {
		clueItem: null,
		loot: null,
		messages: [
			"Cold chills run down {minion}'s spine, dread sets in, this is a bad idea. They do not want to continue.",
			'{minion} is paralyzed with terror, knowing that going further is a grave mistake. They ask you to stop.',
			'{minion} wants nothing more than to turn back, the sense of danger is too high. What to do?'
		]
	}
};

export interface Step {
	hint: string;
	didPass: (data: ActivityTaskData) => boolean | Promise<boolean>;
}

export interface Track {
	id: number;
	steps: [Step, Step, Step, Step, Step, Step, Step];
}

export const mysteriousTrailTracks: Track[] = [
	{
		id: 1,
		steps: [
			firstStep,
			{
				hint: 'Where the masked convene to plot, southwest is the hidden spot.',
				didPass: (data: ActivityTaskData) => {
					if (
						data.type === 'MonsterKilling' &&
						[Monsters.MaleHamMember.id, Monsters.FemaleHamMember.id].includes(data.monsterID)
					) {
						return true;
					}
					if (
						data.type === 'Pickpocket' &&
						[Monsters.MaleHamMember.id, Monsters.FemaleHamMember.id].includes(data.monsterID)
					) {
						return true;
					}

					return false;
				}
			},
			{
				hint: "Outside the white walls, a secret's planted far and wide.",
				didPass: (data: ActivityTaskData) => {
					if (data.type === 'Collecting' && data.collectableID === itemID('Cabbage')) {
						return true;
					}

					return false;
				}
			},
			{
				hint: "Beneath branches that weep not rain, a secret's hidden, not easy to gain.",
				didPass: (data: ActivityTaskData) => {
					if (data.type === 'Woodcutting' && data.logID === itemID('Willow logs')) {
						return true;
					}

					return false;
				}
			},
			{
				hint: 'Pick your own destiny, spin the wheel, pull your own strings.',
				didPass: async (data: ActivityTaskData) => {
					const lastTwoTrips = await prisma.activity.findMany({
						where: {
							user_id: BigInt(data.userID),
							completed: true
						},
						orderBy: {
							finish_date: 'desc'
						},
						take: 2
					});
					const [_spinTrip, _pickTrip] = lastTwoTrips;
					if (!_spinTrip || !_pickTrip) return false;
					const [pickTrip, spinTrip] = [
						convertStoredActivityToFlatActivity(_spinTrip),
						convertStoredActivityToFlatActivity(_pickTrip)
					];
					if (spinTrip.type !== 'Crafting' || spinTrip.craftableID !== itemID('Bow string')) return false;
					if (pickTrip.type !== 'Collecting' || pickTrip.collectableID !== itemID('Flax')) return false;

					return false;
				}
			},
			{
				hint: 'Sound the horn, take your place, in the final wave, the queens embrace.',
				didPass: async (data: ActivityTaskData) => {
					if (data.type === 'BarbarianAssault') return true;
					return false;
				}
			},
			finalStep
		]
	},
	{
		id: 2,
		steps: [
			firstStep,
			{
				hint: "On the rooftops, a hidden maze, not easy to see, except for a lovers' gaze.",
				didPass: (data: ActivityTaskData) =>
					data.type === 'Agility' && data.courseID === 'Varrock Rooftop Course'
			},
			{
				hint: 'In rows and columns, a green parade, sitting in the dirt, where they were made.',
				didPass: (data: ActivityTaskData) => {
					if (data.type === 'Collecting' && data.collectableID === itemID('Cabbage')) {
						return true;
					}

					return false;
				}
			},
			{
				hint: 'Amidst the blue, an orange clue.',
				didPass: (data: ActivityTaskData) => {
					if (data.type === 'Fishing' && data.fishID === itemID('Raw lobster')) {
						return true;
					}

					return false;
				}
			},
			{
				hint: 'An easy task, in Burthorpes shadow, receive your next ask, and then follow.',
				didPass: async (data: ActivityTaskData) => {
					const task = await getUsersCurrentSlayerInfo(data.userID);
					if (
						task.slayerMaster?.name === 'Turael' &&
						data.type === 'MonsterKilling' &&
						task.assignedTask?.monsters.includes(data.monsterID)
					) {
						return true;
					}

					return false;
				}
			},
			{
				hint: "Where brawn doesn't meet brain, one must be slain.",
				didPass: (data: ActivityTaskData) => {
					if (
						data.type === 'MonsterKilling' &&
						[Monsters.TrollGeneral.id, Monsters.MountainTroll.id].includes(data.monsterID)
					) {
						return true;
					}

					return false;
				}
			},
			finalStep
		]
	},
	{
		id: 3,
		steps: [
			firstStep,
			{
				hint: 'In the cinema for the mind, find the entrance, then take the exit.',
				didPass: (data: ActivityTaskData) => {
					if (data.type === 'MageTrainingArena') {
						return true;
					}
					return false;
				}
			},
			{
				hint: "Where blade meets bark, the ripping transformation, a secret's hidden, in what dust remains.",
				didPass: (data: ActivityTaskData) => data.type === 'Sawmill'
			},
			{
				hint: 'In the swamps lantern, where the wolves cry, hide on the roofs, dont let them eye.',
				didPass: (data: ActivityTaskData) =>
					data.type === 'Agility' && data.courseID === 'Canifis Rooftop Course'
			},
			{
				hint: "Deep north, black as night, catch them, but don't let them bite.",
				didPass: (data: ActivityTaskData) => data.type === 'Hunter' && data.creatureName === 'Black salamander'
			},
			{
				hint: 'Hear the echo of a crowned roar, in a place too dangerous to explore.',
				didPass: (data: ActivityTaskData) =>
					data.type === 'MonsterKilling' && data.monsterID === Monsters.KingBlackDragon.id
			},
			finalStep
		]
	},
	{
		id: 4,
		steps: [
			firstStep,
			{
				hint: "Where water bends and warriors stride, a village lives with primal pride, cast into its' shallow tide.",
				didPass: (data: ActivityTaskData) => {
					return data.type === 'Fishing' && resolveItems(['Raw trout', 'Raw salmon']).includes(data.fishID);
				}
			},
			{
				hint: "Where the earth compensates, at the rivers' surge.",
				didPass: (data: ActivityTaskData) => {
					return data.type === 'MotherlodeMining';
				}
			},
			{
				hint: 'Amidst the blue, an orange clue.',
				didPass: (data: ActivityTaskData) => {
					if (data.type === 'Fishing' && data.fishID === itemID('Raw lobster')) {
						return true;
					}

					return false;
				}
			},
			{
				hint: 'A secret is hidden, where the weak are forbidden.',
				didPass: (data: ActivityTaskData) => {
					if (data.type === 'AnimatedArmour' || data.type === 'Cyclops') {
						return true;
					}

					return false;
				}
			},
			{
				hint: "Where brawn doesn't meet brain, one must be slain.",
				didPass: (data: ActivityTaskData) => {
					if (
						data.type === 'MonsterKilling' &&
						[Monsters.TrollGeneral.id, Monsters.MountainTroll.id].includes(data.monsterID)
					) {
						return true;
					}

					return false;
				}
			},
			finalStep
		]
	}
];
