import { KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { MinigameKey } from '../extendables/User/Minigame';
import { MAX_QP } from './constants';
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
	customReq?: (user: KlasaUser) => Promise<[true] | [false, string]>;
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

	if (tier.customReq) {
		const [hasCustomReq, reason] = await tier.customReq(user);
		if (!hasCustomReq) return [hasCustomReq, reason!];
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
export const ArdougneDiary: Diary = {
	name: 'Ardougne',
	easy: {
		name: 'Easy',
		item: getOSItem('Ardougne cloak 1'),
		skillReqs: {
			thieving: 5
		},
		minigameReqs: {
			FishingTrawler: 1
		},
		qp: 10
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Ardougne cloak 2'),
		skillReqs: {
			agility: 39,
			attack: 50,
			crafting: 49,
			farming: 31,
			firemaking: 50,
			magic: 51,
			strength: 38,
			thieving: 38,
			ranged: 21
		},
		minigameReqs: {
			FishingTrawler: 1
		},
		qp: 23,
		collectionLogReqs: resolveItems(["Iban's staff"])
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Ardougne cloak 3'),
		skillReqs: {
			agility: 56,
			construction: 50,
			cooking: 53,
			crafting: 50,
			farming: 70,
			fishing: 53,
			fletching: 5,
			herblore: 45,
			hunter: 59,
			magic: 66,
			mining: 52,
			prayer: 42,
			ranged: 60,
			runecraft: 65,
			smithing: 68,
			strength: 50,
			thieving: 72,
			woodcutting: 50
		},
		qp: 107,
		collectionLogReqs: resolveItems([
			'Red salamander',
			'Dragon sq shield',
			'Death rune',
			'Mithril platebody',
			'Coconut'
		])
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Ardougne cloak 4'),
		skillReqs: {
			agility: 90,
			cooking: 91,
			crafting: 35,
			farming: 85,
			firemaking: 50,
			fishing: 81,
			fletching: 69,
			herblore: 10,
			magic: 94,
			ranged: 40,
			smithing: 91,
			thieving: 82
		},
		qp: 107,
		collectionLogReqs: resolveItems(['Raw manta ray', 'Rune crossbow', 'Grimy torstol']),
		lapsReqs: {
			'Ardougne Rooftop Course': 1
		}
	}
};

export const DesertDiary: Diary = {
	name: 'Desert',
	easy: {
		name: 'Easy',
		item: getOSItem('Desert amulet 1'),
		skillReqs: {
			hunter: 5,
			thieving: 21
		},
		qp: 10,
		collectionLogReqs: resolveItems(['Yellow feather']),
		minigameReqs: {
			PyramidPlunder: 1
		}
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Desert amulet 2'),
		skillReqs: {
			ranged: 37,
			crafting: 50,
			firemaking: 45,
			prayer: 43,
			magic: 39,
			mining: 37,
			agility: 30,
			slayer: 22,
			hunter: 47,
			thieving: 37,
			herblore: 36,
			woodcutting: 35,
			construction: 20
		},
		qp: 22,
		collectionLogReqs: resolveItems(['Orange salamander', 'Teak logs'])
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Desert amulet 3'),
		skillReqs: {
			fletching: 10,
			ranged: 40,
			herblore: 31,
			mining: 60,
			woodcutting: 55,
			agility: 70,
			magic: 68,
			thieving: 65,
			slayer: 65,
			crafting: 61,
			attack: 50,
			defence: 40,
			firemaking: 60,
			smithing: 68
		},
		lapsReqs: {
			'Pollnivneach Rooftop Course': 1
		},
		monsterScores: {
			'Dust devil': 1
		},
		collectionLogReqs: resolveItems(['Mithril platebody'])
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Desert amulet 4'),
		skillReqs: {
			agility: 15,
			herblore: 10,
			firemaking: 50,
			ranged: 40,
			smithing: 20,
			construction: 78,
			cooking: 85,
			fletching: 95,
			magic: 94,
			prayer: 85,
			thieving: 91
		},
		collectionLogReqs: resolveItems(['Dragon dart', 'Kq head'])
	}
};

export const FaladorDiary: Diary = {
	name: 'Falador',
	easy: {
		name: 'Easy',
		item: getOSItem('Falador shield 1'),
		skillReqs: {
			agility: 5,
			construction: 16,
			mining: 10,
			smithing: 13
		}
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Falador shield 2'),
		skillReqs: {
			agility: 42,
			cooking: 20,
			crafting: 40,
			defence: 20,
			farming: 23,
			firemaking: 49,
			magic: 37,
			mining: 40,
			prayer: 10,
			ranged: 19,
			slayer: 32,
			strength: 37,
			thieving: 40,
			woodcutting: 30
		},
		qp: 12,
		collectionLogReqs: resolveItems(['Crystal key', 'Gold ore', 'Willow logs'])
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Falador shield 3'),
		skillReqs: {
			agility: 59,
			attack: 65,
			strength: 65,
			cooking: 53,
			crafting: 31,
			defence: 50,
			farming: 45,
			firemaking: 30,
			fishing: 53,
			herblore: 52,
			mining: 60,
			prayer: 70,
			runecraft: 56,
			slayer: 72,
			thieving: 58,
			woodcutting: 71
		},
		qp: 32,
		collectionLogReqs: resolveItems([
			'Mind rune',
			'Prospector jacket',
			'Prospector helmet',
			'Prospector legs',
			'Prospector boots'
		]),
		monsterScores: {
			'Skeletal wyvern': 1,
			'Blue dragon': 1
		},
		lapsReqs: {
			'Falador Rooftop Course': 1
		}
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Falador shield 4'),
		skillReqs: {
			agility: 80,
			farming: 91,
			herblore: 81,
			mining: 17,
			runecraft: 88,
			thieving: 13,
			woodcutting: 75
		},
		qp: MAX_QP,
		collectionLogReqs: resolveItems(['Air rune', 'Saradomin brew(3)'])
	}
};

export const FremennikDiary: Diary = {
	name: 'Fremennik',
	easy: {
		name: 'Easy',
		item: getOSItem('Fremennik sea boots 1'),
		skillReqs: {
			crafting: 23,
			firemaking: 15,
			hunter: 11,
			mining: 20,
			smithing: 20,
			thieving: 5,
			woodcutting: 15
		},
		collectionLogReqs: resolveItems(['Blue feather', 'Oak logs'])
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Fremennik sea boots 2'),
		skillReqs: {
			agility: 35,
			construction: 37,
			defence: 30,
			hunter: 35,
			mining: 40,
			slayer: 47,
			smithing: 50,
			thieving: 42
		},
		collectionLogReqs: resolveItems(['Coal', 'Snowy knight', 'Gold ore'])
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Fremennik sea boots 3'),
		skillReqs: {
			agility: 32,
			construction: 20,
			crafting: 61,
			defence: 40,
			firemaking: 49,
			fletching: 25,
			herblore: 66,
			hunter: 55,
			magic: 72,
			mining: 70,
			smithing: 60,
			thieving: 75,
			woodcutting: 56
		},
		collectionLogReqs: resolveItems(['Tatty kyatt fur', 'Adamantite ore']),
		qp: 50
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Fremennik sea boots 4'),
		skillReqs: {
			agility: 80,
			crafting: 80,
			hitpoints: 70,
			ranged: 70,
			runecraft: 82,
			slayer: 83,
			strength: 70
		},
		monsterScores: {
			'Dagannoth rex': 1,
			'Dagannoth prime': 1,
			'Dagannoth supreme': 1,
			'General graardor': 1,
			"Kree'arra": 1,
			'Commander zilyana': 1,
			"K'ril Tsutsaroth": 1,
			'Spiritual mage': 1
		},
		collectionLogReqs: resolveItems(['Astral rune', 'Dragonstone amulet']),
		qp: 50
	}
};

export const KandarinDiary: Diary = {
	name: 'Kandarin',
	easy: {
		name: 'Easy',
		item: getOSItem('Kandarin headgear 1'),
		skillReqs: {
			agility: 20,
			farming: 13,
			fishing: 16
		},
		collectionLogReqs: resolveItems(['Mackerel'])
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Kandarin headgear 2'),
		skillReqs: {
			agility: 36,
			cooking: 43,
			farming: 26,
			fishing: 46,
			fletching: 50,
			herblore: 48,
			magic: 45,
			mining: 30,
			ranged: 40,
			strength: 22,
			thieving: 47
		},
		collectionLogReqs: resolveItems(['Bass', 'Maple shortbow', 'Limpwurt root', 'Coal']),
		monsterScores: {
			'Fire giant': 1
		},
		minigameReqs: {
			BarbarianAssault: 1
		}
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Kandarin headgear 3'),
		skillReqs: {
			agility: 60,
			construction: 50,
			crafting: 10,
			defence: 70,
			firemaking: 65,
			fishing: 70,
			fletching: 70,
			prayer: 70,
			magic: 56,
			smithing: 75,
			strength: 50,
			thieving: 53,
			woodcutting: 60
		},
		collectionLogReqs: resolveItems(['Leaping sturgeon', 'Yew longbow']),
		lapsReqs: {
			"Seers' Village Rooftop Course": 1
		},
		monsterScores: {
			'Mithril dragon': 1
		}
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Kandarin headgear 4'),
		skillReqs: {
			agility: 60,
			cooking: 80,
			crafting: 85,
			farming: 79,
			firemaking: 85,
			fishing: 76,
			herblore: 86,
			magic: 87,
			smithing: 90
		},
		collectionLogReqs: resolveItems(['Grimy dwarf weed', 'Shark']),
		customReq: async user => {
			const honourLevel = user.settings.get(UserSettings.HonourLevel);
			if (honourLevel < 5) {
				return [false, `your Barbarian Assault Honour Level is less than 5`];
			}
			return [true];
		}
	}
};

export const KaramjaDiary: Diary = {
	name: 'Karamja',
	easy: {
		name: 'Easy',
		item: getOSItem('Karamja gloves 1'),
		skillReqs: {
			agility: 15,
			mining: 40
		},
		collectionLogReqs: resolveItems(['Gold ore', 'Fire cape']),
		monsterScores: {
			Jogre: 1
		}
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Karamja gloves 2'),
		skillReqs: {
			agility: 12,
			cooking: 16,
			farming: 27,
			fishing: 65,
			hunter: 41,
			mining: 40,
			woodcutting: 50
		},
		collectionLogReqs: resolveItems(['Agility arena ticket', 'Teak logs', 'Raw karambwan'])
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Karamja gloves 3'),
		skillReqs: {
			agility: 53,
			cooking: 53,
			magic: 59,
			mining: 52,
			ranged: 42,
			runecraft: 44,
			slayer: 50,
			smithing: 40,
			strength: 50,
			thieving: 50,
			woodcutting: 34
		},
		collectionLogReqs: resolveItems(['Nature rune', 'Cooked karambwan']),
		monsterScores: {
			'Steel dragon': 1
		}
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Karamja gloves 4'),
		skillReqs: {
			farming: 72,
			herblore: 87,
			runecraft: 91
		},
		collectionLogReqs: resolveItems([
			'Nature rune',
			'Fire cape',
			'Coconut',
			'Calquat fruit',
			'Anti-venom(4)'
		])
	}
};

export const diariesObject = {
	WesternProv,
	ArdougneDiary,
	DesertDiary,
	FaladorDiary,
	FremennikDiary,
	KandarinDiary,
	KaramjaDiary
} as const;
export const diaries = Object.values(diariesObject);
