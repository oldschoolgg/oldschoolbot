import { SimpleTable } from '@oldschoolgg/toolkit';
import { writeFileSync } from 'fs';
import { Bank } from 'oldschooljs';

import { makeWheel } from '../../../lib/wheel';

const spinsGambleAmount = 30_000_000;

interface Reward {
	name: string;
	reward: Bank | (() => void);
	weighting: number;
}
const rewards: Reward[] = [
	...['Egg', 'Tomato', 'Potato'].map(item => ({
		name: item,
		reward: new Bank().add(item),
		weighting: 15
	})),
	{
		name: '1x',
		reward: new Bank().add('Coins', spinsGambleAmount),
		weighting: 50
	},
	{
		name: '2x',
		reward: new Bank().add('Coins', spinsGambleAmount * 2),
		weighting: 40
	},
	{
		name: '100x',
		reward: new Bank().add('Coins', spinsGambleAmount * 100),
		weighting: 1
	},
	{
		name: '5x',
		reward: new Bank().add('Coins', spinsGambleAmount * 5),
		weighting: 5
	},
	{
		name: '1 hour double loot',
		reward: () => {},
		weighting: 5
	},
	{
		name: '24 hours double loot',
		reward: () => {},
		weighting: 1
	},
	{
		name: '1 week T3 patron perks',
		reward: () => {},
		weighting: 1
	}
];

const table = new SimpleTable<Reward>();
for (const reward of rewards) {
	table.add(reward, reward.weighting);
}

async function asdf() {
	const segments: [string, number][] = [];

	for (const segment of rewards) {
		segments.push([segment.name, segment.weighting]);
	}
	for (let i = 0; i < 10; i++) {
		const { name, weighting } = table.rollOrThrow();
		segments.push([name, weighting]);
	}

	const res = await makeWheel(segments);

	writeFileSync(`./${res.winner}.png`, res.image);
}

asdf();
