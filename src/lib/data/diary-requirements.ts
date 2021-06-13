/* Assumes you cannot use spicy stews until Hard Diaries unless 30 crafting */
/* Assumes you cannot use crystal saw until Hard Diaries */

import { SkillsEnum } from '../skilling/types';

export const diaryRequirements: Record<
	string,
	Partial<
		Record<
			SkillsEnum,
			{
				statReq: [number, number, number, number];
				boost: [number, number, number, number];
			}
		>
	>
> = {
	Ardougne: {
		attack: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 38, 50, 0],
			boost: [0, 5, 7, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 25, 60, 40],
			boost: [0, 0, 0, 0]
		},
		prayer: {
			statReq: [0, 0, 42, 0],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 51, 66, 94],
			boost: [0, 4, 5, 5]
		},
		cooking: {
			statReq: [0, 0, 53, 91],
			boost: [0, 0, 5, 6]
		},
		woodcutting: {
			statReq: [0, 36, 50, 0],
			boost: [0, 2, 5, 0]
		},
		fletching: {
			statReq: [0, 0, 5, 69],
			boost: [0, 0, 0, 5]
		},
		fishing: {
			statReq: [0, 0, 53, 81],
			boost: [0, 0, 5, 0]
		},
		firemaking: {
			statReq: [0, 50, 0, 50],
			boost: [0, 5, 0, 5]
		},
		crafting: {
			statReq: [0, 49, 50, 35],
			boost: [0, 0, 0, 5]
		},
		smithing: {
			statReq: [0, 0, 68, 91],
			boost: [0, 0, 5, 5]
		},
		mining: {
			statReq: [0, 40, 52, 0],
			boost: [0, 0, 5, 0]
		},
		herblore: {
			statReq: [0, 14, 45, 10],
			boost: [0, 0, 4, 0]
		},
		agility: {
			statReq: [0, 39, 56, 90],
			boost: [5, 5, 5, 5]
		},
		thieving: {
			statReq: [5, 38, 72, 82],
			boost: [1, 1, 5, 5]
		},
		slayer: {
			statReq: [0, 0, 0, 10],
			boost: [0, 0, 0, 0]
		},
		farming: {
			statReq: [0, 31, 70, 85],
			boost: [0, 3, 5, 5]
		},
		runecraft: {
			statReq: [0, 0, 65, 0],
			boost: [0, 0, 5, 0]
		},
		hunter: {
			statReq: [0, 0, 59, 0],
			boost: [0, 0, 5, 0]
		},
		construction: {
			statReq: [0, 10, 50, 0],
			boost: [0, 0, 0, 0]
		}
	},
	Desert: {
		attack: {
			statReq: [0, 0, 50, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 40, 0],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 37, 40, 40],
			boost: [0, 7, 0, 0]
		},
		prayer: {
			statReq: [0, 43, 0, 85],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 39, 68, 94],
			boost: [0, 0, 3, 5]
		},
		cooking: {
			statReq: [0, 0, 0, 85],
			boost: [0, 0, 0, 6]
		},
		woodcutting: {
			statReq: [0, 35, 55, 0],
			boost: [0, 2, 0, 0]
		},
		fletching: {
			statReq: [0, 0, 10, 95],
			boost: [0, 0, 0, 5]
		},
		fishing: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		firemaking: {
			statReq: [0, 45, 60, 50],
			boost: [0, 0, 5, 5]
		},
		crafting: {
			statReq: [0, 50, 61, 0],
			boost: [0, 0, 0, 0]
		},
		smithing: {
			statReq: [0, 0, 68, 20],
			boost: [0, 0, 5, 5]
		},
		mining: {
			statReq: [5, 37, 50, 0],
			boost: [2, 0, 0, 0]
		},
		herblore: {
			statReq: [0, 36, 31, 10],
			boost: [0, 4, 5, 0]
		},
		agility: {
			statReq: [0, 30, 70, 15],
			boost: [0, 5, 5, 0]
		},
		thieving: {
			statReq: [21, 37, 65, 91],
			boost: [0, 1, 5, 0]
		},
		slayer: {
			statReq: [0, 22, 65, 10],
			boost: [0, 5, 5, 0]
		},
		farming: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		runecraft: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hunter: {
			statReq: [5, 47, 0, 0],
			boost: [3, 3, 0, 0]
		},
		construction: {
			statReq: [0, 20, 0, 78],
			boost: [0, 0, 0, 8]
		}
	},
	Falador: {
		attack: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 20, 50, 0],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 37, 0, 0],
			boost: [10, 0, 0, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 19, 0, 0],
			boost: [0, 5, 0, 0]
		},
		prayer: {
			statReq: [0, 10, 70, 0],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 37, 0, 0],
			boost: [0, 4, 0, 0]
		},
		cooking: {
			statReq: [0, 20, 53, 0],
			boost: [0, 0, 5, 0]
		},
		woodcutting: {
			statReq: [0, 30, 71, 75],
			boost: [0, 5, 5, 5]
		},
		fletching: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		fishing: {
			statReq: [0, 0, 53, 0],
			boost: [0, 0, 5, 0]
		},
		firemaking: {
			statReq: [0, 49, 0, 0],
			boost: [0, 5, 0, 0]
		},
		crafting: {
			statReq: [0, 40, 31, 0],
			boost: [0, 5, 5, 0]
		},
		smithing: {
			statReq: [13, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		mining: {
			statReq: [10, 40, 60, 17],
			boost: [0, 2, 5, 0]
		},
		herblore: {
			statReq: [0, 0, 52, 81],
			boost: [0, 0, 5, 5]
		},
		agility: {
			statReq: [5, 42, 59, 80],
			boost: [5, 5, 5, 5]
		},
		thieving: {
			statReq: [0, 40, 58, 13],
			boost: [0, 1, 5, 0]
		},
		slayer: {
			statReq: [0, 32, 72, 0],
			boost: [0, 5, 5, 0]
		},
		farming: {
			statReq: [0, 23, 45, 91],
			boost: [0, 3, 5, 5]
		},
		runecraft: {
			statReq: [0, 0, 56, 88],
			boost: [0, 0, 5, 5]
		},
		hunter: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		construction: {
			statReq: [16, 0, 0, 0],
			boost: [0, 0, 0, 0]
		}
	},
	Fremennik: {
		attack: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 30, 40, 40],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 0, 0, 70],
			boost: [0, 0, 0, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 70],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 0, 0, 70],
			boost: [0, 0, 0, 0]
		},
		prayer: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 0, 72, 65],
			boost: [0, 0, 5, 0]
		},
		cooking: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		woodcutting: {
			statReq: [15, 50, 56, 55],
			boost: [2, 2, 1, 0]
		},
		fletching: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		fishing: {
			statReq: [0, 0, 35, 0],
			boost: [0, 0, 5, 0]
		},
		firemaking: {
			statReq: [15, 40, 49, 49],
			boost: [0, 0, 0, 0]
		},
		crafting: {
			statReq: [23, 31, 61, 80],
			boost: [4, 4, 0, 5]
		},
		smithing: {
			statReq: [20, 50, 60, 0],
			boost: [2, 2, 0, 0]
		},
		mining: {
			statReq: [20, 40, 70, 60],
			boost: [2, 2, 5, 0]
		},
		herblore: {
			statReq: [0, 0, 66, 5],
			boost: [0, 0, 5, 0]
		},
		agility: {
			statReq: [15, 35, 40, 80],
			boost: [5, 5, 5, 5]
		},
		thieving: {
			statReq: [5, 42, 75, 0],
			boost: [1, 1, 5, 0]
		},
		slayer: {
			statReq: [0, 47, 0, 83],
			boost: [0, 5, 0, 5]
		},
		farming: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		runecraft: {
			statReq: [0, 0, 0, 82],
			boost: [0, 0, 0, 5]
		},
		hunter: {
			statReq: [11, 35, 55, 0],
			boost: [3, 3, 5, 0]
		},
		construction: {
			statReq: [0, 37, 20, 20],
			boost: [0, 0, 0, 0]
		}
	},
	Kandarin: {
		attack: {
			statReq: [0, 0, 20, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 70, 40],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 22, 50, 0],
			boost: [0, 8, 0, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 40, 0, 0],
			boost: [0, 0, 0, 0]
		},
		prayer: {
			statReq: [0, 0, 70, 0],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 45, 56, 87],
			boost: [0, 4, 4, 5]
		},
		cooking: {
			statReq: [0, 43, 30, 80],
			boost: [0, 5, 0, 6]
		},
		woodcutting: {
			statReq: [0, 36, 60, 55],
			boost: [0, 0, 5, 0]
		},
		fletching: {
			statReq: [0, 50, 70, 0],
			boost: [0, 5, 5, 0]
		},
		fishing: {
			statReq: [16, 0, 70, 76],
			boost: [5, 0, 5, 5]
		},
		firemaking: {
			statReq: [0, 0, 65, 85],
			boost: [0, 0, 5, 5]
		},
		crafting: {
			statReq: [0, 31, 25, 85],
			boost: [0, 0, 0, 5]
		},
		smithing: {
			statReq: [0, 30, 75, 90],
			boost: [0, 0, 5, 5]
		},
		mining: {
			statReq: [0, 30, 0, 60],
			boost: [0, 5, 0, 0]
		},
		herblore: {
			statReq: [0, 48, 18, 86],
			boost: [0, 4, 0, 5]
		},
		agility: {
			statReq: [20, 46, 60, 60],
			boost: [5, 5, 5, 5]
		},
		thieving: {
			statReq: [0, 47, 53, 0],
			boost: [0, 5, 0, 0]
		},
		slayer: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		farming: {
			statReq: [13, 26, 0, 79],
			boost: [3, 3, 0, 5]
		},
		runecraft: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hunter: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		construction: {
			statReq: [0, 0, 50, 0],
			boost: [0, 0, 0, 0]
		}
	},
	Karamja: {
		attack: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 0, 50, 0],
			boost: [0, 0, 12, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 0, 42, 0],
			boost: [0, 0, 8, 0]
		},
		prayer: {
			statReq: [0, 0, 42, 0],
			boost: [0, 0, 5, 0]
		},
		magic: {
			statReq: [0, 0, 56, 0],
			boost: [0, 0, 5, 0]
		},
		cooking: {
			statReq: [0, 16, 30, 0],
			boost: [0, 2, 5, 0]
		},
		woodcutting: {
			statReq: [0, 50, 34, 0],
			boost: [0, 2, 0, 0]
		},
		fletching: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		fishing: {
			statReq: [0, 65, 5, 0],
			boost: [0, 5, 0, 0]
		},
		firemaking: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		crafting: {
			statReq: [0, 20, 50, 0],
			boost: [0, 0, 0, 0]
		},
		smithing: {
			statReq: [0, 0, 40, 0],
			boost: [0, 0, 5, 0]
		},
		mining: {
			statReq: [40, 40, 52, 0],
			boost: [2, 2, 5, 0]
		},
		herblore: {
			statReq: [0, 0, 45, 87],
			boost: [0, 0, 5, 5]
		},
		agility: {
			statReq: [15, 32, 53, 0],
			boost: [5, 2, 5, 0]
		},
		thieving: {
			statReq: [0, 0, 50, 0],
			boost: [0, 0, 0, 0]
		},
		slayer: {
			statReq: [0, 0, 50, 0],
			boost: [0, 0, 0, 0]
		},
		farming: {
			statReq: [0, 27, 0, 72],
			boost: [0, 3, 0, 5]
		},
		runecraft: {
			statReq: [0, 0, 44, 91],
			boost: [0, 0, 5, 5]
		},
		hunter: {
			statReq: [0, 41, 0, 0],
			boost: [0, 3, 0, 0]
		},
		construction: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		}
	},
	'Kourend & Kebos': {
		attack: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 40, 0],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 16, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		prayer: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 0, 66, 90],
			boost: [0, 0, 1, 9]
		},
		cooking: {
			statReq: [0, 0, 0, 84],
			boost: [0, 0, 0, 5]
		},
		woodcutting: {
			statReq: [0, 50, 60, 90],
			boost: [0, 2, 5, 5]
		},
		fletching: {
			statReq: [0, 0, 0, 40],
			boost: [0, 0, 0, 5]
		},
		fishing: {
			statReq: [20, 43, 0, 82],
			boost: [5, 0, 0, 5]
		},
		firemaking: {
			statReq: [0, 50, 49, 0],
			boost: [0, 0, 0, 0]
		},
		crafting: {
			statReq: [0, 31, 61, 38],
			boost: [0, 0, 0, 0]
		},
		smithing: {
			statReq: [0, 0, 70, 0],
			boost: [0, 0, 5, 0]
		},
		mining: {
			statReq: [15, 42, 65, 38],
			boost: [2, 2, 5, 0]
		},
		herblore: {
			statReq: [12, 0, 31, 0],
			boost: [4, 0, 5, 0]
		},
		agility: {
			statReq: [0, 49, 32, 0],
			boost: [0, 5, 5, 0]
		},
		thieving: {
			statReq: [25, 20, 49, 0],
			boost: [1, 0, 0, 0]
		},
		slayer: {
			statReq: [0, 0, 62, 95],
			boost: [0, 0, 5, 5]
		},
		farming: {
			statReq: [0, 45, 74, 85],
			boost: [0, 3, 5, 5]
		},
		runecraft: {
			statReq: [0, 0, 0, 77],
			boost: [0, 0, 0, 5]
		},
		hunter: {
			statReq: [0, 53, 0, 0],
			boost: [0, 3, 0, 0]
		},
		construction: {
			statReq: [25, 0, 0, 0],
			boost: [0, 0, 0, 0]
		}
	},
	'Lumbridge/Draynor': {
		attack: {
			statReq: [0, 0, 15, 40],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 0, 65],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 19, 0, 70],
			boost: [0, 7, 0, 15]
		},
		hitpoints: {
			statReq: [0, 0, 0, 50],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 50, 40, 70],
			boost: [0, 0, 0, 11]
		},
		prayer: {
			statReq: [0, 0, 52, 50],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 31, 60, 75],
			boost: [0, 4, 5, 0]
		},
		cooking: {
			statReq: [0, 0, 70, 70],
			boost: [0, 0, 5, 5]
		},
		woodcutting: {
			statReq: [15, 36, 57, 75],
			boost: [2, 0, 0, 5]
		},
		fletching: {
			statReq: [0, 0, 10, 50],
			boost: [0, 0, 0, 0]
		},
		fishing: {
			statReq: [15, 30, 53, 62],
			boost: [5, 5, 5, 0]
		},
		firemaking: {
			statReq: [15, 0, 65, 66],
			boost: [0, 0, 0, 5]
		},
		crafting: {
			statReq: [0, 31, 70, 70],
			boost: [0, 0, 5, 0]
		},
		smithing: {
			statReq: [0, 0, 40, 88],
			boost: [0, 0, 0, 5]
		},
		mining: {
			statReq: [15, 0, 50, 72],
			boost: [2, 0, 5, 4]
		},
		herblore: {
			statReq: [0, 0, 25, 57],
			boost: [0, 0, 5, 5]
		},
		agility: {
			statReq: [10, 20, 48, 70],
			boost: [5, 5, 0, 5]
		},
		thieving: {
			statReq: [0, 38, 53, 78],
			boost: [0, 1, 0, 5]
		},
		slayer: {
			statReq: [7, 18, 10, 69],
			boost: [5, 0, 0, 0]
		},
		farming: {
			statReq: [0, 0, 63, 49],
			boost: [0, 0, 5, 5]
		},
		runecraft: {
			statReq: [5, 23, 59, 76],
			boost: [0, 5, 5, 5]
		},
		hunter: {
			statReq: [0, 42, 0, 60],
			boost: [0, 3, 0, 0]
		},
		construction: {
			statReq: [0, 0, 0, 50],
			boost: [0, 0, 0, 0]
		}
	},
	Morytania: {
		attack: {
			statReq: [0, 0, 20, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 70, 70],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 10, 10, 76],
			boost: [0, 6, 6, 16]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 40, 40, 0],
			boost: [0, 0, 0, 0]
		},
		prayer: {
			statReq: [0, 47, 70, 0],
			boost: [0, 5, 0, 0]
		},
		magic: {
			statReq: [0, 0, 66, 83],
			boost: [0, 0, 4, 5]
		},
		cooking: {
			statReq: [12, 40, 30, 0],
			boost: [2, 0, 0, 0]
		},
		woodcutting: {
			statReq: [0, 45, 50, 55],
			boost: [0, 2, 5, 0]
		},
		fletching: {
			statReq: [0, 5, 10, 0],
			boost: [0, 0, 0, 0]
		},
		fishing: {
			statReq: [0, 50, 50, 96],
			boost: [0, 5, 5, 5]
		},
		firemaking: {
			statReq: [0, 0, 50, 80],
			boost: [0, 0, 5, 5]
		},
		crafting: {
			statReq: [15, 45, 45, 84],
			boost: [4, 0, 0, 5]
		},
		smithing: {
			statReq: [0, 50, 50, 0],
			boost: [0, 0, 0, 0]
		},
		mining: {
			statReq: [0, 0, 55, 60],
			boost: [0, 0, 5, 0]
		},
		herblore: {
			statReq: [0, 22, 18, 15],
			boost: [0, 4, 0, 0]
		},
		agility: {
			statReq: [0, 42, 71, 0],
			boost: [0, 0, 5, 0]
		},
		thieving: {
			statReq: [0, 0, 53, 0],
			boost: [0, 0, 0, 0]
		},
		slayer: {
			statReq: [15, 42, 58, 85],
			boost: [5, 0, 5, 5]
		},
		farming: {
			statReq: [23, 40, 53, 0],
			boost: [3, 3, 5, 0]
		},
		runecraft: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hunter: {
			statReq: [0, 29, 0, 0],
			boost: [0, 3, 0, 0]
		},
		construction: {
			statReq: [0, 0, 50, 0],
			boost: [0, 0, 8, 0]
		}
	},
	Varrock: {
		attack: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 0, 40],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		prayer: {
			statReq: [0, 0, 52, 0],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 25, 54, 86],
			boost: [0, 5, 4, 5]
		},
		cooking: {
			statReq: [0, 0, 0, 95],
			boost: [0, 0, 0, 6]
		},
		woodcutting: {
			statReq: [0, 0, 60, 0],
			boost: [0, 0, 3, 0]
		},
		fletching: {
			statReq: [0, 0, 0, 81],
			boost: [0, 0, 0, 5]
		},
		fishing: {
			statReq: [20, 0, 0, 0],
			boost: [5, 0, 0, 0]
		},
		firemaking: {
			statReq: [0, 40, 60, 0],
			boost: [0, 5, 5, 0]
		},
		crafting: {
			statReq: [8, 36, 0, 61],
			boost: [0, 5, 0, 0]
		},
		smithing: {
			statReq: [0, 0, 0, 89],
			boost: [0, 0, 0, 5]
		},
		mining: {
			statReq: [15, 0, 0, 60],
			boost: [2, 0, 0, 0]
		},
		herblore: {
			statReq: [0, 10, 0, 90],
			boost: [0, 0, 0, 5]
		},
		agility: {
			statReq: [13, 30, 51, 0],
			boost: [5, 5, 5, 0]
		},
		thieving: {
			statReq: [5, 25, 53, 0],
			boost: [0, 0, 0, 0]
		},
		slayer: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		farming: {
			statReq: [0, 30, 68, 0],
			boost: [0, 0, 5, 0]
		},
		runecraft: {
			statReq: [9, 0, 0, 78],
			boost: [0, 0, 0, 5]
		},
		hunter: {
			statReq: [0, 0, 66, 0],
			boost: [0, 0, 0, 0]
		},
		construction: {
			statReq: [0, 0, 50, 0],
			boost: [0, 0, 0, 0]
		}
	},
	'Western Prov.': {
		attack: {
			statReq: [0, 0, 0, 42],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 0, 42],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 0, 0, 42],
			boost: [0, 0, 0, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 42],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [30, 0, 70, 60],
			boost: [0, 0, 0, 0]
		},
		prayer: {
			statReq: [0, 0, 0, 22],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [0, 46, 66, 42],
			boost: [0, 0, 5, 0]
		},
		cooking: {
			statReq: [30, 42, 70, 30],
			boost: [0, 4, 5, 0]
		},
		woodcutting: {
			statReq: [0, 35, 50, 0],
			boost: [0, 2, 5, 0]
		},
		fletching: {
			statReq: [20, 5, 5, 85],
			boost: [0, 0, 0, 5]
		},
		fishing: {
			statReq: [0, 46, 62, 0],
			boost: [0, 5, 5, 0]
		},
		firemaking: {
			statReq: [0, 35, 50, 0],
			boost: [0, 0, 5, 0]
		},
		crafting: {
			statReq: [0, 25, 40, 0],
			boost: [0, 0, 0, 0]
		},
		smithing: {
			statReq: [0, 30, 45, 0],
			boost: [0, 0, 5, 0]
		},
		mining: {
			statReq: [15, 40, 70, 0],
			boost: [2, 2, 5, 0]
		},
		herblore: {
			statReq: [0, 18, 0, 0],
			boost: [0, 0, 0, 0]
		},
		agility: {
			statReq: [0, 37, 56, 85],
			boost: [0, 5, 0, 5]
		},
		thieving: {
			statReq: [0, 0, 75, 85],
			boost: [0, 0, 5, 5]
		},
		slayer: {
			statReq: [0, 0, 0, 93],
			boost: [0, 0, 0, 0]
		},
		farming: {
			statReq: [0, 0, 68, 75],
			boost: [0, 0, 5, 5]
		},
		runecraft: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hunter: {
			statReq: [9, 31, 69, 0],
			boost: [3, 3, 5, 0]
		},
		construction: {
			statReq: [0, 5, 65, 0],
			boost: [0, 0, 8, 0]
		}
	},
	Wilderness: {
		attack: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		defence: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		strength: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hitpoints: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		ranged: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		prayer: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		magic: {
			statReq: [21, 60, 66, 96],
			boost: [4, 4, 4, 5]
		},
		cooking: {
			statReq: [0, 0, 0, 90],
			boost: [0, 0, 0, 6]
		},
		woodcutting: {
			statReq: [0, 61, 0, 75],
			boost: [0, 2, 0, 5]
		},
		fletching: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		fishing: {
			statReq: [0, 0, 53, 85],
			boost: [0, 0, 5, 5]
		},
		firemaking: {
			statReq: [0, 0, 0, 75],
			boost: [0, 0, 0, 5]
		},
		crafting: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		smithing: {
			statReq: [0, 50, 75, 90],
			boost: [0, 2, 5, 5]
		},
		mining: {
			statReq: [15, 55, 0, 85],
			boost: [2, 2, 0, 5]
		},
		herblore: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		agility: {
			statReq: [15, 60, 64, 0],
			boost: [5, 5, 5, 0]
		},
		thieving: {
			statReq: [0, 0, 0, 84],
			boost: [0, 0, 0, 5]
		},
		slayer: {
			statReq: [0, 50, 68, 83],
			boost: [0, 5, 5, 5]
		},
		farming: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		runecraft: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		},
		hunter: {
			statReq: [0, 0, 67, 0],
			boost: [0, 0, 5, 0]
		},
		construction: {
			statReq: [0, 0, 0, 0],
			boost: [0, 0, 0, 0]
		}
	}
};
