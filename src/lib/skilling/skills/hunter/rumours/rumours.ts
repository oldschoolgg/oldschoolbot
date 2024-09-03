import { mentionCommand, type CommandResponse } from '@oldschoolgg/toolkit';
import type { Rumour, RumourOption } from './util';
import { QuestID } from '../../../../minions/data/quests';
import { calcMaxTripLength } from '../../../../util/calcMaxTripLength';
import { Time } from 'e';
import creatures from '../creatures';

const tierToHunterLevel = {
	novice: 46,
	adept: 57,
	expert: 72,
	master: 91
};

export async function rumoursCommand(userID: string, input?: RumourOption): CommandResponse {
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
		return rumoursCommand(user.id, bestTier);
	}

	if (hunterLevel < tierToHunterLevel[input]) {
		return `You need level ${tierToHunterLevel[input]} hunter to do rumours of ${input} difficulty!`;
	}

	const maxTripLength = calcMaxTripLength(user);
	const Rumours: Rumour[] = generateRumourTasks(user, input, maxTripLength);
	
	return 'Meow1';
}

function generateRumourTasks(user: MUser, tier: RumourOption, maxlength: Time.Minute) {
	let Rumours: Rumour[] = [];

	return Rumours;
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
