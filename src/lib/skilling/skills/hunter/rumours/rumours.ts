import { formatDuration, mentionCommand, type CommandResponse } from '@oldschoolgg/toolkit';
import type { Rumour, RumourOption } from './util';
import { QuestID } from '../../../../minions/data/quests';
import { calcMaxTripLength } from '../../../../util/calcMaxTripLength';
import { roll, Time } from 'e';
import creatures from '../creatures';
import { Creature, HunterTechniqueEnum } from '../../../types';
import addSubTaskToActivityTask from '../../../../util/addSubTaskToActivityTask';
import { RumourActivityTaskOptions } from '../../../../types/minions';

const tierToHunterLevel = {
	novice: 46,
	adept: 57,
	expert: 72,
	master: 91
};

const hunterTechniqueToRate: { [key in HunterTechniqueEnum]: number } = {
    [HunterTechniqueEnum.AerialFishing]: -1,
    [HunterTechniqueEnum.DriftNet]: -1,
    [HunterTechniqueEnum.BirdSnaring]: 20,
    [HunterTechniqueEnum.BoxTrapping]: 50,
    [HunterTechniqueEnum.ButterflyNetting]: 75,
    [HunterTechniqueEnum.DeadfallTrapping]: 15,
    [HunterTechniqueEnum.Falconry]: 10,
    [HunterTechniqueEnum.MagicBoxTrapping]: -1,
    [HunterTechniqueEnum.NetTrapping]: 25,
    [HunterTechniqueEnum.PitfallTrapping]: 15,
    [HunterTechniqueEnum.RabbitSnaring]: -1,
    [HunterTechniqueEnum.Tracking]: 15,
};

export async function rumoursCommand(userID: string, channelID: string, input?: RumourOption): CommandResponse {
	const user = await mUserFetch(userID);
	const hunterLevel = user.skillsAsLevels.hunter;

	if (!user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		return `You need to complete the "Children of the Sun" quest before you can be assigned a hunter rumour. Send your minion to do the quest using: ${mentionCommand(
			globalClient,
			'activities',
			'quest'
		)}.`;
	}

	if (hunterLevel < 46) {
		return 'You need at least level 46 in Hunter to begin doing Hunter Rumours.';
	}

	if (!input) {
		const bestTier = highestLevelRumour(user);
		return rumoursCommand(user.id, channelID, bestTier);
	}

	if (hunterLevel < tierToHunterLevel[input]) {
		return `You need level ${tierToHunterLevel[input]} hunter to do rumours of ${input} difficulty!`;
	}

	const maxTripLength = calcMaxTripLength(user);
	const Rumours: Rumour[] = generateRumourTasks(user, input, maxTripLength);

	const totalDuration = Rumours.reduce((acc, rumour) => acc + rumour.duration, 0);
	
	await addSubTaskToActivityTask<RumourActivityTaskOptions>({
		userID: user.id,
		channelID: channelID,
		quantity: Rumours.length,
		rumours: Rumours,
		duration: totalDuration,
		type: 'Rumour'
	}) 
	
	return `${user.minionName} is now completing ${Rumours.length} ${input} tier rumours. It'll take around ${formatDuration(totalDuration)} to finish.`;
}

function generateRumourTasks(user: MUser, tier: RumourOption, maxLength: Time.Minute) {
	const hunterLevel = user.skillsAsLevels.hunter;

	let Rumours: Rumour[] = [];
	let totalDuration = 0;
	const maxDurationInSeconds = maxLength / 1000;

	const filteredCreatures = creatures.filter(
		creature => creature.tier && creature.tier.includes(tier) && creature.level <= hunterLevel
	);

	let lastSelectedCreature: Creature | null = null;

	while (totalDuration < maxDurationInSeconds) {
		const shuffledCreatures = filteredCreatures.sort(() => 0.5 - Math.random());

		let selectedCreature: Creature | null = null;
		for (const creature of shuffledCreatures) {
			if (creature !== lastSelectedCreature) {
				selectedCreature = creature;
				break;
			}
		}

		if (!selectedCreature) break;

		const DurationAndQty = calcDurationAndQty(selectedCreature);

		if (totalDuration + DurationAndQty[0] > (maxDurationInSeconds + (maxDurationInSeconds / 3))) {
			break;
		}

		Rumours.push({
			creature: selectedCreature,
			duration: Time.Second * DurationAndQty[0],
			quantity: DurationAndQty[1]
		});

		totalDuration += DurationAndQty[0];
		lastSelectedCreature = selectedCreature;
	}

	console.log(`Rumours generated: ${Rumours.length} for a total of ${totalDuration} seconds`);
	console.log('Rumours: ', Rumours);

	return Rumours;
}

function calcDurationAndQty(creature: Creature): [number, number] {
	const dropRate = hunterTechniqueToRate[creature.huntTechnique];

	if (dropRate === -1) {
		throw new Error(`Drop rate not defined for hunting technique: ${creature.huntTechnique} This shouldn't be possible as all possible rumours have assigned droprates`);
	}

	let creaturesHunted = 0;

	for (let i = 0; i < dropRate * 2; i++) {
		creaturesHunted++;

		if (roll(dropRate)) {
			break;
		}
	}

	const timeTaken = (creaturesHunted * creature.catchTime) + 90; //90 Seconds assumed for time taken to get hunter gear out and make it to the location.

	return [timeTaken, creaturesHunted];
}

function highestLevelRumour(user: MUser) {
	return Object.entries(tierToHunterLevel)
		.sort((a, b) => b[1] - a[1])
		.find(a => user.skillLevel('hunter') >= a[1])?.[0] as RumourOption | undefined;
}

export async function rumourCount(userID: string): CommandResponse {
	const user = await mUserFetch(userID);
	const { rumours: rumoursCompleted } = await user.fetchStats({ rumours: true });
	let totalrumours = rumoursCompleted.reduce((a, b) => a + b)

	if (totalrumours) {
		return `Your minion has completed:\n${rumoursCompleted[0]} Novice rumours.\n${rumoursCompleted[1]} Adept rumours.\n${rumoursCompleted[2]} Expert rumours.\n${rumoursCompleted[3]} Master rumours.\nTotal: ${totalrumours}`
	} else {
		return `Your minion has not completed any rumours yet. You can send your minion to complete rumours by running ${mentionCommand(
			globalClient,
			'rumours',
			'start'
		)}`;
	}
}
