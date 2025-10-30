import path from 'node:path';
import { AttachmentBuilder } from '@oldschoolgg/discord.js';
import type { Image } from 'skia-canvas';

import { createCanvas, loadAndCacheLocalImage, printWrappedText } from '@/lib/canvas/canvasUtil.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';

type HeadKey =
	| 'mejJal'
	| 'jane'
	| 'santa'
	| 'izzy'
	| 'alry'
	| 'ketKeh'
	| 'gertrude'
	| 'antiSanta'
	| 'bunny'
	| 'minimus'
	| 'partyPete'
	| 'mysteriousFigure'
	| 'rudolph'
	| 'pumpkin'
	| 'marimbo'
	| 'spookling'
	| 'magnaboy'
	| 'wurMuTheMonkey';

const basePath = './src/lib/resources/images';
const chatBase = `${basePath}/chat_heads`;

const chatHeadPaths: Record<HeadKey, string> = {
	mejJal: 'mejJal.png',
	jane: 'jane.png',
	santa: 'santa.png',
	izzy: 'izzy.png',
	alry: 'alryTheAngler.png',
	ketKeh: 'ketKeh.png',
	gertrude: 'gertrude.png',
	antiSanta: 'antisanta.png',
	bunny: 'bunny.png',
	minimus: 'minimus.png',

	// BSO
	partyPete: 'partyPete.png',
	mysteriousFigure: 'mysteriousFigure.png',
	rudolph: 'rudolph.png',
	pumpkin: 'pumpkin.png',
	marimbo: 'marimbo.png',
	spookling: 'spookling.png',
	magnaboy: 'magnaboy.png',
	wurMuTheMonkey: 'monkeychild.png'
};

const names: Record<HeadKey, string> = {
	mejJal: 'TzHaar-Mej-Jal',
	jane: 'Guildmaster Jane',
	santa: 'Santa',
	izzy: "Cap'n Izzy No-Beard",
	alry: 'Alry the Angler',
	ketKeh: 'TzHaar-Ket-Keh',
	gertrude: 'Gertrude',
	antiSanta: 'Anti-Santa',
	bunny: 'Easter Bunny',
	minimus: 'Minimus',

	// BSO
	partyPete: 'Party Pete',
	mysteriousFigure: 'Mysterious Figure',
	rudolph: 'Rudolph the Reindeer',
	pumpkin: 'Pumpkinhead',
	marimbo: 'Marimbo',
	spookling: 'Spookling',
	magnaboy: 'Magnaboy',
	wurMuTheMonkey: 'Wur Mu the Monkey'
};

const imagePromiseCache = new Map<string, Promise<Image>>();

const loadOnce = (absPath: string): Promise<any> => {
	let p = imagePromiseCache.get(absPath);
	if (!p) {
		p = loadAndCacheLocalImage(absPath);
		imagePromiseCache.set(absPath, p);
	}
	return p;
};

const getTextbox = () => loadOnce(path.join(basePath, 'textbox.png'));
const getChatHead = (key: HeadKey) => loadOnce(path.join(chatBase, chatHeadPaths[key]));

export async function newChatHeadImage({ content, head }: { content: string; head: HeadKey }) {
	const canvas = createCanvas(519, 142);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	const [bg, headImage] = await Promise.all([getTextbox(), getChatHead(head)]);

	ctx.drawImage(bg, 0, 0);
	ctx.drawImage(headImage, 28, bg.height / 2 - headImage.height / 2);
	ctx.font = '16px RuneScape Quill 8';

	ctx.fillStyle = '#810303';
	const name = names[head];
	const nameWidth = Math.floor(ctx.measureText(name).width);
	ctx.fillText(name, Math.floor(307 - nameWidth / 2), 36);

	ctx.fillStyle = '#000';
	printWrappedText(ctx, content, 307, 58, 361);

	const scaledCanvas = new OSRSCanvas({ width: canvas.width * 2, height: canvas.height * 2 });
	scaledCanvas.ctx.drawImage(
		canvas,
		0,
		0,
		canvas.width,
		canvas.height,
		0,
		0,
		scaledCanvas.width,
		scaledCanvas.height
	);
	return scaledCanvas.toBuffer();
}

export default async function chatHeadImage({ content, head }: { content: string; head: HeadKey }) {
	const image = await newChatHeadImage({ content, head });
	return new AttachmentBuilder(image);
}

export async function mahojiChatHead({ content, head }: { content: string; head: HeadKey }) {
	const image = await newChatHeadImage({ content, head });
	return { files: [{ attachment: image, name: 'image.jpg' }] };
}
