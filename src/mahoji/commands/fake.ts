import { randInt } from '@oldschoolgg/rng';
import type { Image } from 'skia-canvas';

import {
	type CanvasContext,
	canvasToBuffer,
	createCanvas,
	loadAndCacheLocalImage,
	measureTextWidth
} from '@/lib/canvas/canvasUtil.js';

let bg: Image | null = null;

const randomMessages = ['omfgggggg', '!#@$@#$@##@$', 'adfsjklfadkjsl;l', 'l00000l wtf'];

function arma(ctx: CanvasContext, username: string) {
	ctx.fillText("Your Kree'arra kill count is: ", 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(randInt(1, 20).toString(), 12 + measureTextWidth(ctx, "Your Kree'arra kill count is: "), 10);

	ctx.fillStyle = '#ff0000';
	ctx.fillText("You have a funny feeling like you're being followed.", 11, 25);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: Pet kree'arra`, 11, 40);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: ${Math.random() > 0.5 ? 'Armadyl hilt' : 'Armadyl chestplate'}`, 11, 54);

	/* Username */
	const randMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
	ctx.fillStyle = '#000000';
	ctx.fillText(`${username}: `, 11, 69);
	ctx.fillStyle = '#0000ff';
	ctx.fillText(`${randMessage}*`, 12 + measureTextWidth(ctx, `${username}: `), 69);
}

function bandos(ctx: CanvasContext, username: string) {
	ctx.fillText('Your General Graardor kill count is: ', 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(randInt(1, 20).toString(), 12 + measureTextWidth(ctx, 'Your General Graardor kill count is: '), 10);

	ctx.fillStyle = '#ff0000';
	ctx.fillText("You have a funny feeling like you're being followed.", 11, 25);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: Pet general graardor`, 11, 40);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: Bandos ${Math.random() > 0.5 ? 'chestplate' : 'tassets'}`, 11, 54);

	/* Username */
	const randMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
	ctx.fillStyle = '#000000';
	ctx.fillText(`${username}: `, 11, 69);
	ctx.fillStyle = '#0000ff';
	ctx.fillText(`${randMessage}*`, 12 + measureTextWidth(ctx, `${username}: `), 69);
}

function ely(ctx: CanvasContext, username: string) {
	ctx.fillText('Your Corporeal Beast kill count is: ', 11, 40);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(
		randInt(1, 20).toLocaleString(),
		12 + measureTextWidth(ctx, 'Your Corporeal Beast kill count is: '),
		40
	);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: Elysian sigil`, 11, 54);

	ctx.fillStyle = '#000000';
	ctx.fillText(`${username}: `, 11, 70);
	ctx.fillStyle = '#0000ff';
	ctx.fillText('*', 12 + measureTextWidth(ctx, `${username}: `), 70);
}

function sara(ctx: CanvasContext, username: string) {
	ctx.fillText('Your Commander Zilyana kill count is: ', 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(randInt(1, 20).toString(), 12 + measureTextWidth(ctx, 'Your Commander Zilyana kill count is: '), 10);

	ctx.fillStyle = '#ff0000';
	ctx.fillText("You have a funny feeling like you're being followed.", 11, 25);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: Pet zilyana`, 11, 40);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: ${Math.random() > 0.5 ? 'Saradomin hilt' : 'Armadyl crossbow'}`, 11, 54);
	const randMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
	ctx.fillStyle = '#000000';
	ctx.fillText(`${username}: `, 11, 69);
	ctx.fillStyle = '#0000ff';
	ctx.fillText(`${randMessage}*`, 12 + measureTextWidth(ctx, `${username}: `), 69);
}

function scythe(ctx: CanvasContext, username: string) {
	const kc = randInt(1, 20);
	/* Your completed Theatre of Blood count is: X. */
	ctx.fillText('Your completed Theatre of Blood count is: ', 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(kc.toString(), 12 + measureTextWidth(ctx, 'Your completed Theatre of Blood count is: '), 10);
	ctx.fillStyle = '#000000';
	ctx.fillText('.', 12 + measureTextWidth(ctx, `Your completed Theatre of Blood count is: ${kc}`), 10);

	/* Username found something special: Scythe of vitur (uncharged) */
	ctx.fillStyle = '#ff0000';
	ctx.fillText(username, 11, 25);
	ctx.fillStyle = '#000000';
	ctx.fillText(' found something special: ', 12 + measureTextWidth(ctx, username), 25);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(
		'Scythe of vitur (uncharged)',
		12 + measureTextWidth(ctx, `${username} found something special: `),
		25
	);

	/* Username found something special: Lil' Zik */
	ctx.fillStyle = '#ff0000';
	ctx.fillText(username, 11, 54);
	ctx.fillStyle = '#000000';
	ctx.fillText(' found something special: ', 12 + measureTextWidth(ctx, username), 54);
	ctx.fillStyle = '#ff0000';
	ctx.fillText("Lil' Zik", 12 + measureTextWidth(ctx, `${username} found something special: `), 54);

	/* You have a funny feeling like you're being followed. */
	ctx.fillText("You have a funny feeling like you're being followed.", 11, 40);

	/* Username */
	ctx.fillStyle = '#000000';
	ctx.fillText(`${username}: `, 11, 70);
	ctx.fillStyle = '#0000ff';
	ctx.fillText('*', 12 + measureTextWidth(ctx, `${username}: `), 70);
}

function zammy(ctx: CanvasContext, username: string) {
	ctx.fillText("Your K'ril Tsutsaroth kill count is: ", 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(randInt(1, 20).toString(), 12 + measureTextWidth(ctx, "Your K'ril Tsutsaroth kill count is: "), 10);

	ctx.fillStyle = '#ff0000';
	ctx.fillText("You have a funny feeling like you're being followed.", 11, 25);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: Pet k'ril tsutsaroth`, 11, 40);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: ${Math.random() > 0.5 ? 'Zamorak hilt' : 'Staff of the dead'}`, 11, 54);

	/* Username */
	const randMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
	ctx.fillStyle = '#000000';
	ctx.fillText(`${username}: `, 11, 69);
	ctx.fillStyle = '#0000ff';
	ctx.fillText(`${randMessage}*`, 12 + measureTextWidth(ctx, `${username}: `), 69);
}

const thingMap = [
	[new Set(['zammy', 'zamorak']), zammy],
	[new Set(['tob', 'scythe']), scythe],
	[new Set(['sara', 'zilyana', 'zily']), sara],
	[new Set(['corp', 'ely']), ely],
	[new Set(['bandos']), bandos],
	[new Set(['arma', 'armadyl']), arma]
] as const;

export const fakeCommand = defineCommand({
	name: 'fake',
	description: 'Generate fake images of getting loot.',
	options: [
		{
			type: 'String',
			name: 'type',
			description: 'The type you want to generate.',
			required: true,
			choices: thingMap.map(i => Array.from(i[0])[0]).map(i => ({ name: i, value: i }))
		},
		{
			type: 'String',
			name: 'username',
			description: 'The username to put on the image.',
			required: true
		}
	],
	run: async ({ options }) => {
		const canvas = createCanvas(399, 100);
		const ctx = canvas.getContext('2d');

		ctx.font = '16px OSRSFont';
		ctx.fillStyle = '#000000';

		if (!bg) {
			bg = await loadAndCacheLocalImage('./src/lib/resources/images/tob-bg.png');
		}
		ctx.drawImage(bg, 0, 0, bg.width, bg.height);
		for (const [names, fn] of thingMap) {
			if (names.has(options.type.toLowerCase())) {
				fn(ctx, options.username);
				return {
					files: [
						{
							buffer: await canvasToBuffer(canvas),
							name: `${Math.round(Math.random() * 10_000)}.jpg`
						}
					]
				};
			}
		}
		return 'Invalid input.';
	}
});
