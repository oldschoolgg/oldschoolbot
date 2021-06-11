import { KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { MinigameKey } from '../extendables/User/Minigame';
import { UserSettings } from './settings/types/UserSettings';
import { courses } from './skilling/skills/agility';
import { Skills } from './types';
import { itemNameFromID } from './util';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';

interface DiaryTier {
	name: 'Easy' | 'Medium' | 'Hard' | 'Elite';
	item: Item;
	skillReqs: Skills;
	ownedItems?: number[];
	collectionLogReqs?: number[];
	minigameReqs?: Partial<Record<MinigameKey, number>>;
	lapsReqs?: Record<string, number>;
	qp?: number;
	monsterScores?: Record<string, number>;
}
interface Diary {
	name: string;
	easy: DiaryTier;
	medium: DiaryTier;
	hard: DiaryTier;
	elite: DiaryTier;
}

export async function userhasDiaryTier(
	user: KlasaUser,
	tier: DiaryTier
): Promise<[true] | [false, string]> {
	const [hasSkillReqs, reason] = user.hasSkillReqs(tier.skillReqs);
	if (!hasSkillReqs) {
		return [false, `you don't have these stats: ${reason!}`];
	}

	if (tier.ownedItems) {
		const bank = user.bank();
		const unownedItems = tier.ownedItems.filter(i => !bank.has(i));
		if (unownedItems.length > 0) {
			return [false, `you don't own ${unownedItems.map(itemNameFromID).join(', ')}`];
		}
	}

	if (tier.collectionLogReqs) {
		const cl = new Bank(user.settings.get(UserSettings.CollectionLogBank));
		const unownedItems = tier.collectionLogReqs.filter(i => !cl.has(i));
		if (unownedItems.length > 0) {
			return [
				false,
				`you don't have ${unownedItems
					.map(itemNameFromID)
					.join(', ')} in your collection log`
			];
		}
	}

	if (tier.qp && user.settings.get(UserSettings.QP) < tier.qp) {
		return [false, `you don't have ${tier.qp} Quest Points`];
	}

	if (tier.minigameReqs) {
		const entries = Object.entries(tier.minigameReqs);
		const scores = await user.getAllMinigameScores();
		for (const [key, neededScore] of entries) {
			const thisScore = scores.find(m => m.minigame.key === key)!;
			if (thisScore.score < neededScore!) {
				return [
					false,
					`you don't have ${neededScore} KC in ${thisScore.minigame.name}, you have ${thisScore.score}`
				];
			}
		}
	}

	if (tier.lapsReqs) {
		const entries = Object.entries(tier.lapsReqs);
		const userLaps = user.settings.get(UserSettings.LapsScores);
		for (const [name, score] of entries) {
			const course = courses.find(c => c.name === name)!;

			if (userLaps[course.id] || userLaps[course.id] < score) {
				return [false, `you don't have ${score} laps at ${course.name}`];
			}
		}
	}

	if (tier.monsterScores) {
		const entries = Object.entries(tier.monsterScores);
		const userScores = user.settings.get(UserSettings.MonsterScores);
		for (const [name, score] of entries) {
			const mon = Monsters.find(mon => mon.name === name)!;

			if (userScores[mon.id] || userScores[mon.id] < score) {
				return [false, `you don't have ${score} ${mon.name} KC`];
			}
		}
	}

	return [true];
}

export const WesternProv: Diary = {
	name: 'Western Provinces',
	easy: {
		name: 'Easy',
		item: getOSItem('Western banner 1'),
		skillReqs: {
			fletching: 20,
			hunter: 9,
			mining: 15,
			ranged: 30
		},
		minigameReqs: {
			BigChompyBirdHunting: 30
		},
		collectionLogReqs: resolveItems(['Orange feather', 'Iron ore', 'Oak shortbow']),
		lapsReqs: {
			'Gnome Stronghold Agility Course': 1
		},
		qp: 10
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Western banner 2'),
		skillReqs: {
			agility: 37,
			cooking: 42,
			firemaking: 35,
			fishing: 46,
			fletching: 5,
			hunter: 31,
			mining: 40,
			ranged: 30,
			woodcutting: 35
		},
		collectionLogReqs: resolveItems(['Raw bass', 'Teak logs', 'Gold ore']),
		minigameReqs: {
			BigChompyBirdHunting: 125,
			GnomeRestaurant: 1
		},
		qp: 44
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Western banner 3'),
		skillReqs: {
			agility: 56,
			construction: 65,
			cooking: 70,
			farming: 68,
			firemaking: 50,
			fishing: 62,
			fletching: 5,
			hunter: 69,
			ranged: 70,
			magic: 64,
			mining: 70,
			thieving: 75,
			woodcutting: 50
		},
		collectionLogReqs: resolveItems([
			'Raw monkfish',
			'Dashing kebbit fur',
			'Mahogany logs',
			'Adamantite ore'
		]),
		lapsReqs: {
			'Ape Atoll Agility Course': 1
		},
		minigameReqs: {
			BigChompyBirdHunting: 300
		},
		qp: 92,
		monsterScores: {
			Zulrah: 1
		}
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Western banner 4'),
		skillReqs: {
			agility: 85,
			attack: 42,
			defence: 42,
			farming: 75,
			fletching: 85,
			hitpoints: 42,
			magic: 42,
			prayer: 22,
			ranged: 42,
			slayer: 93,
			strength: 42,
			thieving: 85
		},
		collectionLogReqs: resolveItems([
			'Magic longbow',
			'Void knight top',
			'Void knight robe',
			'Void knight gloves'
		]),
		monsterScores: {
			'Thermonuclear smoke devil': 1
		},
		minigameReqs: {
			BigChompyBirdHunting: 1000
		}
	}
};

export const diaries = [WesternProv];
export const diariesObject = {
	WesternProv
};
