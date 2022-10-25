import { shuffleArr, sumArr } from 'e';

import { Winwheel } from './winwheel';

function randomHexColor(num: number) {
	const hue = num * 137.508;
	return `hsl(${hue},50%,75%)`;
}

export async function makeWheel(_entries: readonly (readonly [string, number])[]) {
	const totalWeight = sumArr(_entries.map(i => i[1]));
	const entries = shuffleArr(_entries).map(i => ({
		fillStyle: randomHexColor(_entries.indexOf(i)),
		text: `${i[0]}`,
		textAlignment: 'outer',
		weight: i[1],
		size: (i[1] / totalWeight) * 360
	}));

	const wheel = new Winwheel({
		size: 500,
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
	return result;
}
