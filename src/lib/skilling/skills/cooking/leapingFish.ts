import getOSItem from '../../../util/getOSItem';
import type { CutLeapingFish } from '../../types';

const LeapingFish: CutLeapingFish[] = [
	{
		item: getOSItem('Leaping sturgeon'),
		aliases: ['leaping sturgeon', 'cut leaping sturgeon', 'sturgeon'],
		tickRate: 1
	},
	{
		item: getOSItem('Leaping trout'),
		aliases: ['leaping trout', 'cut leaping trout'],
		tickRate: 1
	},
	{
		item: getOSItem('Leaping salmon'),
		aliases: ['leaping salmon', 'cut leaping salmon'],
		tickRate: 1
	}
];

export default LeapingFish;
