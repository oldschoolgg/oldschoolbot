import { SkillsEnum } from '../../skilling/types';

interface TrekShopItem {
	name: string;
	easyRange: [number, number];
	medRange: [number, number];
	hardRange: [number, number];
	possibleResults: string[];
	aliases?: string[];
}

const TrekShopItems: TrekShopItem[] = [
	{
		name: 'Pure essence',
		easyRange: [50, 150],
		medRange: [120, 380],
		hardRange: [370, 660],
		aliases: ['pure', 'essence'],
		possibleResults: ['Pure essence']
	},
	{
		name: 'Bow string',
		easyRange: [100, 200],
		medRange: [150, 250],
		hardRange: [200, 300],
		aliases: ['bow', 'string'],
		possibleResults: ['Bow string']
	},
	{
		name: 'Silver bar',
		easyRange: [5, 50],
		medRange: [50, 100],
		hardRange: [100, 150],
		aliases: ['silver', 'bar'],
		possibleResults: ['Silver bar']
	},
	{
		name: 'Herbs',
		easyRange: [5, 15],
		medRange: [10, 20],
		hardRange: [15, 30],
		possibleResults: ['Tarromin', 'Harralander', 'Toadflax']
	},
	{
		name: 'Ore',
		easyRange: [21, 72],
		medRange: [66, 165],
		hardRange: [150, 216],
		possibleResults: ['Coal', 'Iron ore']
	},
	{
		name: 'Watermelon seeds',
		easyRange: [10, 20],
		medRange: [15, 30],
		hardRange: [20, 40],
		aliases: ['water', 'watermelon', 'seeds'],
		possibleResults: ['Watermelon seeds']
	},
	{
		name: 'Raw lobsters',
		easyRange: [2, 35],
		medRange: [30, 65],
		hardRange: [60, 80],
		aliases: ['water', 'watermelon', 'seeds'],
		possibleResults: ['Raw lobsters']
	},
	{
		name: 'Experience',
		easyRange: [1100, 1650],
		medRange: [2035, 3025],
		hardRange: [4015, 5005],
		aliases: ['xp'],
		possibleResults: []
	}
];

export const TrekExperience: SkillsEnum[] = [
	SkillsEnum.Agility,
	SkillsEnum.Thieving,
	SkillsEnum.Slayer,
	SkillsEnum.Firemaking,
	SkillsEnum.Fishing,
	SkillsEnum.Woodcutting,
	SkillsEnum.Mining
];

export default TrekShopItems;
