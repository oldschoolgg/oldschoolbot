import { SimpleTable } from '@oldschoolgg/toolkit';
import { ChatInputCommandInteraction } from 'discord.js';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { handleGamblingOutcome } from '../../../lib/itemSinkTax';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { makeWheel } from '../../../lib/wheel';

export const spinsGambleAmount = 50_000_000;

interface Reward {
	name: string;
	reward: number | Bank | (() => void);
	weighting: number;
}
const rewards: Reward[] = [
	...['Egg', 'Tomato', 'Potato'].map(item => ({
		name: item,
		reward: new Bank().add(item),
		weighting: 50
	})),
	{
		name: '1x',
		reward: spinsGambleAmount,
		weighting: 50
	},
	{
		name: '2x',
		reward: spinsGambleAmount * 2,
		weighting: 40
	},
	{
		name: '50x',
		reward: spinsGambleAmount * 100,
		weighting: 1
	},
	{
		name: '5x',
		reward: spinsGambleAmount * 5,
		weighting: 20
	},
	{
		name: '1 hour double loot',
		reward: () => {},
		weighting: 8
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

function makeSegments() {
	const segments: [string, number][] = [];

	for (const segment of rewards) {
		segments.push([segment.name, segment.weighting]);
	}
	for (let i = 0; i < 10; i++) {
		const { name, weighting } = table.rollOrThrow();
		segments.push([name, weighting]);
	}
	return segments;
}

async function prepareWheel() {
	return makeWheel(makeSegments());
}

export async function spinsCommand(user: MUser, interaction: ChatInputCommandInteraction): CommandResponse {
	await deferInteraction(interaction);

	if (user.isIronman) return "You're an ironman and you cant play dice.";

	if (spinsGambleAmount > user.GP) return "You don't have enough GP.";

	await handleMahojiConfirmation(interaction, `Are you sure you want to gamble ${spinsGambleAmount} GP?`);

	await handleGamblingOutcome({ type: 'Spins', user, totalAmount: -spinsGambleAmount });
	await user.removeItemsFromBank(new Bank().add('Coins', spinsGambleAmount));

	const { image, winner } = await prepareWheel();
	const winningSegment = rewards.find(reward => reward.name === winner);
	if (!winningSegment) throw new Error(`Invalid winning segment: ${winner}`);

	if (typeof winningSegment.reward === 'number') {
		await handleGamblingOutcome({ type: 'Spins', user, totalAmount: winningSegment.reward });
		await user.addItemsToBank({ items: new Bank().add('Coins', winningSegment.reward) });
	} else if (typeof winningSegment.reward === 'function') {
		winningSegment.reward();
	} else {
		await user.addItemsToBank({ items: winningSegment.reward });
	}

	return {
		files: [image],
		content: `You spun the wheel and won **${winningSegment.name}**!`
	};
}
