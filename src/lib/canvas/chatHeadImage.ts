import path from 'node:path';
import { AttachmentBuilder } from 'discord.js';

import { OSRSCanvas } from './OSRSCanvas';
import { createCanvas, loadAndCacheLocalImage, printWrappedText } from './canvasUtil';

export const textBoxFile = loadAndCacheLocalImage('./src/lib/resources/images/textbox.png');

function loadChImg(fileName: string) {
	const basePath = './src/lib/resources/images/chat_heads/';
	return loadAndCacheLocalImage(path.join(basePath, fileName));
}

const mejJalChatHead = loadChImg('mejJal.png');
const janeChatHead = loadChImg('jane.png');
const santaChatHead = loadChImg('santa.png');
const izzyChatHead = loadChImg('izzy.png');
const alryTheAnglerChatHead = loadChImg('alryTheAngler.png');
const ketKehChatHead = loadChImg('ketKeh.png');
const gertrudeChatHead = loadChImg('gertrude.png');
const antiSantaChatHead = loadChImg('antisanta.png');
const bunnyChatHead = loadChImg('bunny.png');
const minimusHead = loadChImg('minimus.png');
const pumpkinHead = loadChImg('pumpkin.png');
const spookling = loadChImg('spookling.png');
const monkeyChildChatHead = loadChImg('monkeychild.png');
const magnaboyChatHead = loadChImg('magnaboy.png');
const marimboChatHead = loadChImg('marimbo.png');
const partyPeteHead = loadChImg('partyPete.png');
const mysteriousFigureHead = loadChImg('mysteriousFigure.png');
const rudolphChatHead = loadChImg('rudolph.png');

const chatHeads = {
	mejJal: mejJalChatHead,
	jane: janeChatHead,
	santa: santaChatHead,
	izzy: izzyChatHead,
	alry: alryTheAnglerChatHead,
	ketKeh: ketKehChatHead,
	gertrude: gertrudeChatHead,
	antiSanta: antiSantaChatHead,
	bunny: bunnyChatHead,
	minimus: minimusHead,

	// BSO
	partyPete: partyPeteHead,
	mysteriousFigure: mysteriousFigureHead,
	rudolph: rudolphChatHead,
	pumpkin: pumpkinHead,
	marimbo: marimboChatHead,
	spookling: spookling,
	magnaboy: magnaboyChatHead,
	wurMuTheMonkey: monkeyChildChatHead
};

const names: Record<keyof typeof chatHeads, string> = {
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

export async function newChatHeadImage({ content, head }: { content: string; head: keyof typeof chatHeads }) {
	const canvas = createCanvas(519, 142);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	const headImage = await chatHeads[head];
	const bg = await textBoxFile;

	ctx.drawImage(bg, 0, 0);
	ctx.drawImage(headImage, 28, bg.height / 2 - headImage.height / 2);
	ctx.font = '16px RuneScape Quill 8';

	ctx.fillStyle = '#810303';
	const nameWidth = Math.floor(ctx.measureText(names[head]).width);
	ctx.fillText(names[head], Math.floor(307 - nameWidth / 2), 36);
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

export default async function chatHeadImage({ content, head }: { content: string; head: keyof typeof chatHeads }) {
	const image = await newChatHeadImage({ content, head });
	return new AttachmentBuilder(image);
}

export async function mahojiChatHead({ content, head }: { content: string; head: keyof typeof chatHeads }) {
	const image = await newChatHeadImage({ content, head });
	return {
		files: [{ attachment: image, name: 'image.jpg' }]
	};
}
