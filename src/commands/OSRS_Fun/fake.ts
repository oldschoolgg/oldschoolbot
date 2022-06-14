import { MessageAttachment } from 'discord.js';
import { randInt } from 'e';
import fs from 'fs';
import { CommandStore, KlasaMessage } from 'klasa';
import { Canvas, CanvasRenderingContext2D, loadImage } from 'skia-canvas/lib';

import { BotCommand } from '../../lib/structures/BotCommand';

const bg = fs.readFileSync('./src/lib/resources/images/tob-bg.png');

const randomMessages = ['omfgggggg', '!#@$@#$@##@$', 'adfsjklfadkjsl;l', 'l00000l wtf'];

function arma(ctx: CanvasRenderingContext2D, username: string) {
	ctx.fillText("Your Kree'arra kill count is: ", 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(randInt(1, 20).toString(), 12 + ctx.measureText("Your Kree'arra kill count is: ").width, 10);

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
	ctx.fillText(`${randMessage}*`, 12 + ctx.measureText(`${username}: `).width, 69);
}

function bandos(ctx: CanvasRenderingContext2D, username: string) {
	ctx.fillText('Your General Graardor kill count is: ', 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(randInt(1, 20).toString(), 12 + ctx.measureText('Your General Graardor kill count is: ').width, 10);

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
	ctx.fillText(`${randMessage}*`, 12 + ctx.measureText(`${username}: `).width, 69);
}

function ely(ctx: CanvasRenderingContext2D, username: string) {
	ctx.fillText('Your Corporeal Beast kill count is: ', 11, 40);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(
		randInt(1, 20).toLocaleString(),
		12 + ctx.measureText('Your Corporeal Beast kill count is: ').width,
		40
	);

	ctx.fillStyle = '#005f00';
	ctx.fillText(`${username} received a drop: Elysian sigil`, 11, 54);

	ctx.fillStyle = '#000000';
	ctx.fillText(`${username}: `, 11, 70);
	ctx.fillStyle = '#0000ff';
	ctx.fillText('*', 12 + ctx.measureText(`${username}: `).width, 70);
}

function sara(ctx: CanvasRenderingContext2D, username: string) {
	ctx.fillText('Your Commander Zilyana kill count is: ', 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(randInt(1, 20).toString(), 12 + ctx.measureText('Your Commander Zilyana kill count is: ').width, 10);

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
	ctx.fillText(`${randMessage}*`, 12 + ctx.measureText(`${username}: `).width, 69);
}

function scythe(ctx: CanvasRenderingContext2D, username: string) {
	const kc = randInt(1, 20);
	/* Your completed Theatre of Blood count is: X. */
	ctx.fillText('Your completed Theatre of Blood count is: ', 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(kc.toString(), 12 + ctx.measureText('Your completed Theatre of Blood count is: ').width, 10);
	ctx.fillStyle = '#000000';
	ctx.fillText('.', 12 + ctx.measureText(`Your completed Theatre of Blood count is: ${kc}`).width, 10);

	/* Username found something special: Scythe of vitur (uncharged) */
	ctx.fillStyle = '#ff0000';
	ctx.fillText(username, 11, 25);
	ctx.fillStyle = '#000000';
	ctx.fillText(' found something special: ', 12 + ctx.measureText(username).width, 25);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(
		'Scythe of vitur (uncharged)',
		12 + ctx.measureText(`${username} found something special: `).width,
		25
	);

	/* Username found something special: Lil' Zik */
	ctx.fillStyle = '#ff0000';
	ctx.fillText(username, 11, 54);
	ctx.fillStyle = '#000000';
	ctx.fillText(' found something special: ', 12 + ctx.measureText(username).width, 54);
	ctx.fillStyle = '#ff0000';
	ctx.fillText("Lil' Zik", 12 + ctx.measureText(`${username} found something special: `).width, 54);

	/* You have a funny feeling like you're being followed. */
	ctx.fillText("You have a funny feeling like you're being followed.", 11, 40);

	/* Username */
	ctx.fillStyle = '#000000';
	ctx.fillText(`${username}: `, 11, 70);
	ctx.fillStyle = '#0000ff';
	ctx.fillText('*', 12 + ctx.measureText(`${username}: `).width, 70);
}

function zammy(ctx: CanvasRenderingContext2D, username: string) {
	ctx.fillText("Your K'ril Tsutsaroth kill count is: ", 11, 10);
	ctx.fillStyle = '#ff0000';
	ctx.fillText(randInt(1, 20).toString(), 12 + ctx.measureText("Your K'ril Tsutsaroth kill count is: ").width, 10);

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
	ctx.fillText(`${randMessage}*`, 12 + ctx.measureText(`${username}: `).width, 69);
}

const thingMap = [
	[new Set(['zammy', 'zamorak']), zammy],
	[new Set(['tob', 'scythe']), scythe],
	[new Set(['sara', 'zilyana', 'zily']), sara],
	[new Set(['corp', 'ely']), ely],
	[new Set(['bandos']), bandos],
	[new Set(['arma', 'armadyl']), arma]
] as const;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Generates fake loot images.',
			examples: ['+fake arma Magnaboy'],
			requiredPermissionsForBot: ['ATTACH_FILES'],
			usage: '<zammy|tob|sara|corp|bandos|arma> <username:...string>',
			usageDelim: ' ',
			categoryFlags: ['fun']
		});
	}

	async run(msg: KlasaMessage, [thingName, username]: [string, string]) {
		const canvas = new Canvas(399, 100);
		const ctx = canvas.getContext('2d');

		ctx.font = '16px OSRSFont';
		ctx.fillStyle = '#000000';

		const image = await loadImage(bg);
		ctx.drawImage(image, 0, 0, image.width, image.height);
		for (const [names, fn] of thingMap) {
			if (names.has(thingName.toLowerCase())) {
				fn(ctx, username);
				return msg.channel.send({
					files: [
						new MessageAttachment(await canvas.toBuffer('png'), `${Math.round(Math.random() * 10_000)}.jpg`)
					]
				});
			}
		}
		return msg.channel
			.send(`Invalid name. You need to specify what monster/thing you want to make a fake loot of, valid options are: ${thingMap
			.map(i => Array.from(i[0].values())[0])
			.join(', ')}.

For example: \`${msg.cmdPrefix}\`fake bandos Magnaboy`);
	}
}
