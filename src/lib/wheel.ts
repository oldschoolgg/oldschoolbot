import { shuffleArr } from 'e';
import { writeFileSync } from 'fs';
import { Canvas } from 'skia-canvas/lib';

import { Winwheel } from './winwheel';

const CANVAS_SIZE = 500;

const canvas = new Canvas(CANVAS_SIZE, CANVAS_SIZE);
const ctx = canvas.getContext('2d');
ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
const users = [
	['1 Hour Double loot', 1500],
	['2 days Double loot', 200],
	['No Double loot', 1000],
	['5 hours Double loot', 1000],
	['2 Hour Double loot', 1000],
	['24 Hour Double loot', 800]
] as const;
let entries: { text: string; textAlignment: string; weight: number; size: number; fillStyle: string }[] = [];
let totalWeight = 0;

for (const u of shuffleArr(users)) {
	entries.push({
		fillStyle: randomHexColor(users.indexOf(u)),
		text: `${u[0]} (${u[1].toLocaleString()} tickets`,
		textAlignment: 'outer',
		weight: u[1],
		size: 0
	});
	totalWeight += u[1];
}
for (const item of entries) {
	item.size = (item.weight / totalWeight) * 360;
}
function randomHexColor(num: number) {
	const hue = num * 137.508;
	return `hsl(${hue},50%,75%)`;
}
new Winwheel({
	canvas,
	numSegments: entries.length, // Specify number of segments.
	outerRadius: CANVAS_SIZE / 2, // Set outer radius so wheel fits inside the background.
	textFontSize: 12,
	segments: entries,
	lineWidth: 1,
	// Specify the animation to use.
	animation: {
		type: 'spinToStop',
		// duration: rand(19, 22),
		// callbackFinished: alertPrize,
		// callbackSound: playSound, // Function to call when the tick sound is to be triggered.
		soundTrigger: 'pin'
	},
	pins: {
		number: entries.length // Number of pins. They space evenly around the wheel.
	}
});
writeFileSync('___WHEEL___.png', canvas.toBufferSync('png'));
