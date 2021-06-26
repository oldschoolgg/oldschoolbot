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

export interface DiaryTier {
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

export async function userhasDiaryTier(user: KlasaUser, tier: DiaryTier): Promise<[true] | [false, string]> {
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
			return [false, `you don't have ${unownedItems.map(itemNameFromID).join(', ')} in your collection log`];
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

			if (!userLaps[course.id] || userLaps[course.id] < score) {
				return [false, `you don't have ${score} laps at ${course.name}`];
			}
		}
	}

	if (tier.monsterScores) {
		const entries = Object.entries(tier.monsterScores);
		const userScores = user.settings.get(UserSettings.MonsterScores);
		for (const [name, score] of entries) {
			const mon = Monsters.find(mon => mon.name === name)!;
			if (!userScores[mon.id] || userScores[mon.id] < score) {
				return [false, `you don't have ${score} ${mon.name} KC, you have ${userScores[mon.id] ?? 0} KC`];
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
		collectionLogReqs: resolveItems(['Raw monkfish', 'Dashing kebbit fur', 'Mahogany logs', 'Adamantite ore']),
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
		collectionLogReqs: resolveItems(['Magic longbow', 'Void knight top', 'Void knight robe', 'Void knight gloves']),
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
			'Dust Devil': 1
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
			'Skeletal Wyvern': 1,
			'Blue Dragon': 1
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
			'Dagannoth Rex': 1,
			'Dagannoth Prime': 1,
			'Dagannoth Supreme': 1,
			'General Graardor': 1,
			"Kree'arra": 1,
			'Commander Zilyana': 1,
			"K'ril Tsutsaroth": 1,
			'Spiritual Mage': 1
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
			'Fire Giant': 1
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
			'Mithril Dragon': 1
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
				return [false, 'your Barbarian Assault Honour Level is less than 5'];
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
		collectionLogReqs: resolveItems(['Gold ore']),
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
			'Steel Dragon': 1
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
		collectionLogReqs: resolveItems(['Nature rune', 'Fire cape', 'Coconut', 'Calquat fruit', 'Anti-venom(4)'])
	}
};

export const KourendKebosDiary: Diary = {
	name: 'Kourend & Kebos',
	easy: {
		name: 'Easy',
		item: getOSItem("Rada's blessing 1"),
		skillReqs: {
			construction: 25,
			fishing: 20,
			herblore: 12,
			mining: 15,
			thieving: 25
		},
		collectionLogReqs: resolveItems(['Iron ore', 'Raw trout', 'Strength potion(3)'])
	},
	medium: {
		name: 'Medium',
		item: getOSItem("Rada's blessing 2"),
		skillReqs: {
			agility: 49,
			crafting: 30,
			farming: 45,
			firemaking: 50,
			fishing: 43,
			hunter: 53,
			mining: 42,
			woodcutting: 50
		},
		minigameReqs: {
			Wintertodt: 1
		},
		collectionLogReqs: resolveItems(['Chinchompa'])
	},
	hard: {
		name: 'Hard',
		item: getOSItem("Rada's blessing 3"),
		skillReqs: {
			farming: 74,
			magic: 66,
			mining: 65,
			slayer: 62,
			smithing: 70,
			thieving: 49,
			woodcutting: 60
		},
		collectionLogReqs: resolveItems(['Adamantite bar']),
		monsterScores: {
			Wyrm: 1,
			'Lizardman Shaman': 1
		}
	},
	elite: {
		name: 'Elite',
		item: getOSItem("Rada's blessing 4"),
		skillReqs: {
			cooking: 84,
			crafting: 38,
			farming: 85,
			fishing: 82,
			fletching: 40,
			magic: 90,
			mining: 38,
			runecraft: 77,
			slayer: 95,
			woodcutting: 90
		},
		collectionLogReqs: resolveItems(['Blood rune', 'Redwood logs', 'Dark totem', 'Raw anglerfish']),
		monsterScores: {
			Hydra: 1
		},
		minigameReqs: {
			Raids: 1
		}
	}
};
export const LumbridgeDraynorDiary: Diary = {
	name: 'Lumbridge & Draynor',
	easy: {
		name: 'Easy',
		item: getOSItem("Explorer's ring 1"),
		skillReqs: {
			agility: 10,
			firemaking: 15,
			fishing: 15,
			mining: 15,
			runecraft: 5,
			slayer: 7,
			woodcutting: 15
		},
		lapsReqs: {
			'Draynor Village Rooftop Course': 1
		},
		collectionLogReqs: resolveItems(['Water rune', 'Oak logs', 'Raw anchovies', 'Iron ore'])
	},
	medium: {
		name: 'Medium',
		item: getOSItem("Explorer's ring 2"),
		skillReqs: {
			agility: 20,
			crafting: 38,
			fishing: 30,
			hunter: 50,
			magic: 31,
			ranged: 50,
			runecraft: 23,
			strength: 19,
			thieving: 38,
			woodcutting: 36
		},
		lapsReqs: {
			'Al Kharid Rooftop Course': 1
		},
		collectionLogReqs: resolveItems(['Raw salmon', 'Willow logs', 'Coif'])
	},
	hard: {
		name: 'Hard',
		item: getOSItem("Explorer's ring 3"),
		skillReqs: {
			agility: 46,
			crafting: 70,
			farming: 63,
			firemaking: 65,
			magic: 60,
			prayer: 52,
			runecraft: 59,
			woodcutting: 57
		},
		collectionLogReqs: resolveItems(['Cosmic rune', 'Barrows gloves', 'Amulet of power'])
	},
	elite: {
		name: 'Elite',
		item: getOSItem("Explorer's ring 4"),
		skillReqs: {
			agility: 70,
			ranged: 70,
			runecraft: 76,
			smithing: 88,
			strength: 70,
			thieving: 78,
			woodcutting: 75
		},
		collectionLogReqs: resolveItems(['Magic logs', 'Water rune', 'Adamant platebody']),
		qp: MAX_QP
	}
};

export const MorytaniaDiary: Diary = {
	name: 'Morytania',
	easy: {
		name: 'Easy',
		item: getOSItem('Morytania legs 1'),
		skillReqs: {
			cooking: 12,
			crafting: 15,
			farming: 23,
			slayer: 15
		},
		monsterScores: {
			Banshee: 1,
			Ghoul: 1,
			Werewolf: 1
		}
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Morytania legs 2'),
		skillReqs: {
			agility: 42,
			cooking: 40,
			fishing: 50,
			herblore: 22,
			hunter: 29,
			slayer: 42,
			smithing: 50,
			woodcutting: 45
		},
		collectionLogReqs: resolveItems(['Swamp lizard', 'Cannonball']),
		lapsReqs: {
			'Canifis Rooftop Course': 1
		}
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Morytania legs 3'),
		skillReqs: {
			agility: 71,
			construction: 50,
			defence: 70,
			farming: 53,
			firemaking: 50,
			magic: 66,
			mining: 55,
			prayer: 70,
			slayer: 58,
			woodcutting: 50,
			smithing: 50,
			thieving: 42
		},
		collectionLogReqs: resolveItems(['Watermelon', 'Mahogany logs', 'Mithril ore', 'Mushroom']),
		monsterScores: {
			'Cave Horror': 1
		}
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Morytania legs 4'),
		skillReqs: {
			attack: 70,
			crafting: 84,
			defence: 70,
			firemaking: 80,
			fishing: 96,
			magic: 83,
			ranged: 70,
			slayer: 85,
			strength: 76
		},
		collectionLogReqs: resolveItems(['Raw shark', "Black d'hide body"]),
		monsterScores: {
			'Abyssal Demon': 1
		}
	}
};

export const VarrockDiary: Diary = {
	name: 'Varrock',
	easy: {
		name: 'Easy',
		item: getOSItem('Varrock armour 1'),
		skillReqs: {
			agility: 13,
			crafting: 8,
			fishing: 20,
			mining: 15,
			runecraft: 9,
			thieving: 5
		},
		collectionLogReqs: resolveItems(['Iron ore', 'Plank', 'Logs', 'Earth rune', 'Raw trout'])
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Varrock armour 2'),
		skillReqs: {
			agility: 30,
			crafting: 36,
			farming: 30,
			firemaking: 40,
			herblore: 10,
			magic: 25,
			thieving: 25
		},
		collectionLogReqs: resolveItems(['Strength potion(3)', 'Mahogany plank']),
		lapsReqs: {
			'Varrock Rooftop Course': 1
		},
		qp: 32
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Varrock armour 3'),
		skillReqs: {
			agility: 51,
			construction: 50,
			farming: 68,
			firemaking: 60,
			hunter: 66,
			magic: 54,
			prayer: 52,
			ranged: 40,
			thieving: 53,
			woodcutting: 60
		},
		collectionLogReqs: resolveItems(['Yew roots', 'Yew logs']),
		qp: 44
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Varrock armour 4'),
		skillReqs: {
			cooking: 95,
			fletching: 81,
			herblore: 90,
			magic: 86,
			runecraft: 78,
			smithing: 89
		},
		collectionLogReqs: resolveItems(['Super combat potion(4)', 'Mahogany plank', 'Rune dart', 'Earth rune'])
	}
};

export const WildernessDiary: Diary = {
	name: 'Wilderness',
	easy: {
		name: 'Easy',
		item: getOSItem('Wilderness sword 1'),
		skillReqs: {
			agility: 15,
			magic: 21,
			mining: 15
		},
		collectionLogReqs: resolveItems(["Red spiders' eggs", 'Iron ore']),
		monsterScores: {
			Mammoth: 1,
			'Earth Warrior': 1
		}
	},
	medium: {
		name: 'Medium',
		item: getOSItem('Wilderness sword 2'),
		skillReqs: {
			agility: 60,
			strength: 60,
			magic: 60,
			mining: 55,
			slayer: 50,
			smithing: 50,
			woodcutting: 61
		},
		collectionLogReqs: resolveItems(['Mithril ore', 'Yew logs']),
		monsterScores: {
			'Green dragon': 1,
			Ankou: 1,
			Bloodveld: 1
		}
	},
	hard: {
		name: 'Hard',
		item: getOSItem('Wilderness sword 3'),
		skillReqs: {
			agility: 64,
			fishing: 53,
			hunter: 67,
			magic: 66,
			slayer: 68,
			smithing: 75
		},
		collectionLogReqs: resolveItems(['Black salamander', 'Adamant scimitar']),
		monsterScores: {
			'Chaos Elemental': 1,
			'Crazy Archaeologist': 1,
			'Chaos Fanatic': 1,
			Scorpia: 1,
			'Spiritual Warrior': 1
		}
	},
	elite: {
		name: 'Elite',
		item: getOSItem('Wilderness sword 4'),
		skillReqs: {
			agility: 60,
			cooking: 90,
			firemaking: 75,
			fishing: 85,
			magic: 96,
			mining: 85,
			slayer: 83,
			smithing: 90,
			strength: 60,
			thieving: 84,
			woodcutting: 75
		},
		collectionLogReqs: resolveItems(['Rune scimitar', 'Raw dark crab', 'Dark crab', 'Magic logs']),
		monsterScores: {
			Callisto: 1,
			Venenatis: 1,
			"Vet'ion": 1
		}
	}
};

export const diariesObject = {
	ArdougneDiary,
	DesertDiary,
	FaladorDiary,
	FremennikDiary,
	KandarinDiary,
	KaramjaDiary,
	KourendKebosDiary,
	LumbridgeDraynorDiary,
	MorytaniaDiary,
	WesternProv,
	WildernessDiary,
	VarrockDiary
} as const;
export const diaries = Object.values(diariesObject);
