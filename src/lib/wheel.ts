import { Canvas } from '@napi-rs/canvas';
import { calcWhatPercent, clamp, shuffleArr, sumArr } from 'e';

import { Winwheel } from './winwheel';

function sortAvoidSmallestNeighbors(arr: [string, number][]): [string, number][] {
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
	const result: [string, number][] = [];
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

export async function makeWheel(_entries: [string, number][]) {
	const totalWeight = sumArr(_entries.map(i => i[1]));

	const entries = sortAvoidSmallestNeighbors(_entries).map(i => {
		const percentOfMax = calcWhatPercent(i[1], totalWeight);
		let color = '#331e1e';
		if (percentOfMax <= 1) {
			color = '#a103fc';
		} else if (percentOfMax < 5) {
			color = '#ff0000';
		} else if (percentOfMax < 15) {
			color = '#9e2b2b';
		} else if (percentOfMax < 25) {
			color = '#6b2d2d';
		}

		return {
			fillStyle: color,
			text: `${i[0]}`,
			textAlignment: 'outer',
			weight: i[1],
			size: (i[1] / totalWeight) * 360,
			textFillStyle: '#FFFF00',
			textFontFamily: 'OSRSFontCompact',
			textFontSize: clamp(Math.round(i[1] * 5), 16, 50)
		};
	});

	const wheel = new Winwheel({
		size: 850,
		numSegments: entries.length,
		textFontSize: 12,
		segments: entries,
		lineWidth: 1,
		pointerAngle: 90,
		pointerGuide: {
			display: true,
			strokeStyle: 'red',
			lineWidth: 3
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

	return {
		image: canvas.toBuffer('image/png'),
		winner: result.winner
	};
}
