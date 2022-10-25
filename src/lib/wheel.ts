import { shuffleArr } from 'e';

import { Winwheel } from './winwheel';

const users = [
	['45x', 45],
	['20x', 20],
	['5x', 5],
	['1x', 1],
	['1x', 1],
	['28x', 28]
] as const;
let entries: { text: string; textAlignment: string; weight: number; size: number; fillStyle: string }[] = [];

for (const u of shuffleArr(users)) {
	entries.push({
		fillStyle: randomHexColor(users.indexOf(u)),
		text: `${u[0]}`,
		textAlignment: 'outer',
		weight: u[1],
		size: 0
	});
}

function randomHexColor(num: number) {
	const hue = num * 137.508;
	return `hsl(${hue},50%,75%)`;
}

export async function makeWheel() {
	const wheel = new Winwheel({
		size: 500,
		numSegments: entries.length,
		textFontSize: 12,
		segments: entries,
		lineWidth: 1
	});

	const result = await wheel.staticSpin();
	return result;
}
