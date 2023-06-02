import { Canvas, Image } from '@napi-rs/canvas';
import { SimpleTable } from '@oldschoolgg/toolkit';
import { ChatInputCommandInteraction } from 'discord.js';
import { clamp, shuffleArr, sumArr } from 'e';
import { readFileSync } from 'fs';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import { handleGamblingOutcome } from '../../../lib/itemSinkTax';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { Winwheel } from '../../../lib/winwheel';

export const spinsGambleAmount = 50_000_000;

const arrowImage = new Image();
arrowImage.src = readFileSync('./src/lib/resources/images/arrow.png');

function sortAvoidSmallestNeighbors(arr: [string, number, string][]): [string, number, string][] {
	// Sort the array by the number
	const sortedArr = arr.sort((a, b) => a[1] - b[1]);

	// Separate into two arrays (smaller and larger numbers)
	const middleIndex = Math.ceil(sortedArr.length / 2);
	const smallerNumbers = sortedArr.slice(0, middleIndex);
	const largerNumbers = sortedArr.slice(middleIndex);

	// Shuffle the two arrays separately
	const shuffledSmallerNumbers = shuffleArr(smallerNumbers);
	const shuffledLargerNumbers = shuffleArr(largerNumbers);

	// Merge two arrays by taking elements alternatively from each array
	const result: [string, number, string][] = [];
	for (let i = 0; i < shuffledSmallerNumbers.length || i < shuffledLargerNumbers.length; i++) {
		if (i < shuffledLargerNumbers.length) {
			result.push(shuffledLargerNumbers[i]);
		}
		if (i < shuffledSmallerNumbers.length) {
			result.push(shuffledSmallerNumbers[i]);
		}
	}

	return result;
}

export async function makeWheel(_entries: [string, number, string][]) {
	const totalWeight = sumArr(_entries.map(i => i[1]));

	const entries = sortAvoidSmallestNeighbors(_entries).map(i => {
		return {
			fillStyle: i[2],
			text: `${i[0]}`,
			textAlignment: 'outer',
			weight: i[1],
			size: (i[1] / totalWeight) * 360,
			textFillStyle: '#FFFF00',
			textFontFamily: 'OSRSFontCompact',
			textFontSize: clamp(Math.round(i[1] * 5), 20, 50)
		};
	});

	const wheel = new Winwheel({
		size: 850,
		numSegments: entries.length,
		textFontSize: 12,
		segments: entries,
		lineWidth: 1,
		pointerAngle: 0,
		pointerGuide: {
			display: true,
			strokeStyle: '#fdfa7b',
			lineWidth: 2
		}
	});

	const result = await wheel.staticSpin();
	const wheelCanvas = result.newCanvas;

	const padding = 100;
	const size = wheelCanvas.width + padding;
	const canvas = new Canvas(size, size);
	const ctx = canvas.getContext('2d');
	const bgSprite = bankImageGenerator.bgSpriteList.default;
	ctx.font = '16px OSRSFontCompact';
	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = ctx.createPattern(bgSprite.repeatableBg, 'repeat')!;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	bankImageGenerator.drawBorder(ctx, bgSprite, false);

	ctx.drawImage(wheelCanvas, padding / 2, padding / 2);
	ctx.drawImage(
		arrowImage,
		canvas.width / 2 - arrowImage.width / 2,
		canvas.height / 2 - wheelCanvas.height / 2 - arrowImage.height
	);

	return {
		image: await canvas.encode('png'),
		winner: result.winner
	};
}

interface Reward {
	name: string;
	reward: number | (() => Bank);
	weighting: number;
	color: string;
}
const rewards: Reward[] = [
	...['Egg', 'Tomato', 'Potato'].map(item => ({
		name: item,
		reward: () => new Bank().add(item),
		weighting: 56,
		color: '#594d3a'
	})),
	{
		name: '1x',
		reward: spinsGambleAmount,
		weighting: 55,
		color: '#0f970d'
	},
	{
		name: '2x',
		reward: spinsGambleAmount * 2,
		weighting: 42,
		color: '#0f970d'
	},
	{
		name: '50x',
		reward: spinsGambleAmount * 50,
		weighting: 2,
		color: '#f200ff'
	},
	{
		name: '100m',
		reward: 100_000_000,
		weighting: 16,
		color: '#0f970d'
	},
	{
		name: '1b',
		reward: 1_000_000_000,
		weighting: 4,
		color: '#0f970d'
	},
	{
		name: '4x',
		reward: spinsGambleAmount * 4,
		weighting: 9,
		color: '#0f970d'
	}
];

const table = new SimpleTable<Reward>();
for (const reward of rewards) {
	table.add(reward, reward.weighting);
}

function makeSegments() {
	const segments: [string, number, string][] = [];

	for (const segment of rewards) {
		segments.push([segment.name, segment.weighting, segment.color]);
	}
	for (let i = 0; i < 10; i++) {
		const { name, weighting, color } = table.rollOrThrow();
		segments.push([name, weighting, color]);
	}
	return segments;
}

export let winnerTracker: any = {};
for (const reward of rewards) winnerTracker[reward.name] = 0;

export async function spinsCommand(user: MUser, interaction: ChatInputCommandInteraction): CommandResponse {
	await deferInteraction(interaction);
	if (user.isIronman) return "You're an ironman and you cant play dice.";
	if (spinsGambleAmount > user.GP) return "You don't have enough GP.";

	await handleMahojiConfirmation(interaction, `Are you sure you want to gamble ${toKMB(spinsGambleAmount)} GP?`);
	await handleGamblingOutcome({ type: 'Spins', user, totalAmount: -spinsGambleAmount });
	await user.removeItemsFromBank(new Bank().add('Coins', spinsGambleAmount));

	const { image, winner } = await makeWheel(makeSegments());
	const winningSegment = rewards.find(reward => reward.name === winner);
	if (!winningSegment) throw new Error(`Invalid winning segment: ${winner}`);

	if (typeof winningSegment.reward === 'number') {
		await handleGamblingOutcome({ type: 'Spins', user, totalAmount: winningSegment.reward });
		await user.addItemsToBank({ items: new Bank().add('Coins', winningSegment.reward) });
		winnerTracker[winningSegment.name] += winningSegment.reward;
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
