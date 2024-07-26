import { SkillsEnum } from '../../skilling/types';

interface TrekShopItem {
	name: string;
	easyRange: [number, number];
	medRange: [number, number];
	hardRange: [number, number];
	aliases?: string[];
}

const TrekShopItems: TrekShopItem[] = [
	{
		name: 'Pure essence',
		easyRange: [50, 150],
		medRange: [120, 380],
		hardRange: [370, 660],
		aliases: ['pure', 'essence']
	},
	{
		name: 'Bow string',
		easyRange: [100, 200],
		medRange: [150, 250],
		hardRange: [200, 300],
		aliases: ['bow', 'string']
	},
	{
		name: 'Silver bar',
		easyRange: [5, 50],
		medRange: [50, 100],
		hardRange: [100, 150],
		aliases: ['silver', 'bar']
	},
	{
		name: 'Herbs',
		easyRange: [5, 15],
		medRange: [10, 20],
		hardRange: [15, 30]
	},
	{
		name: 'Ore',
		easyRange: [21, 72],
		medRange: [66, 165],
		hardRange: [150, 216]
	},
	{
		name: 'Watermelon seed',
		easyRange: [10, 20],
		medRange: [15, 30],
		hardRange: [20, 40],
		aliases: ['water', 'watermelon', 'seeds', 'watermelon seeds']
	},
	{
		name: 'Raw lobster',
		easyRange: [2, 35],
		medRange: [30, 65],
		hardRange: [60, 80],
		aliases: ['lobster', 'raw lobsters']
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
