import { registerFont } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { MessageAttachment } from 'discord.js';
import * as fs from 'fs';

registerFont('./src/lib/resources/osrs-font-quill-8.ttf', { family: 'Regular' });

const textBoxFile = fs.readFileSync('./src/lib/resources/images/textbox.png');
const mejJalChatHead = fs.readFileSync('./src/lib/resources/images/mejJal.png');
const janeChatHead = fs.readFileSync('./src/lib/resources/images/jane.png');
const santaChatHead = fs.readFileSync('./src/lib/resources/images/santa.png');
const izzyChatHead = fs.readFileSync('./src/lib/resources/images/izzy.png');
const alryTheAnglerChatHead = fs.readFileSync('./src/lib/resources/images/alryTheAngler.png');
const ketKehChatHead = fs.readFileSync('./src/lib/resources/images/ketKeh.png');
const gertrudeChatHead = fs.readFileSync('./src/lib/resources/images/gertrude.png');
const antiSantaChatHead = fs.readFileSync('./src/lib/resources/images/antisanta.png');

export const chatHeads = {
	mejJal: mejJalChatHead,
	jane: janeChatHead,
	santa: santaChatHead,
	izzy: izzyChatHead,
	alry: alryTheAnglerChatHead,
	ketKeh: ketKehChatHead,
	gertrude: gertrudeChatHead,
	antiSanta: antiSantaChatHead
};

const names: Record<keyof typeof chatHeads, string> = {
	mejJal: 'TzHaar-Mej-Jal',
	jane: 'Guildmaster Jane',
	santa: 'Santa',
	izzy: "Cap'n Izzy No-Beard",
	alry: 'Alry the Angler',
	ketKeh: 'Tzhaar-Ket-Keh',
	gertrude: 'Gertrude',
	antiSanta: 'Anti-Santa'
};

export default async function chatHeadImage({ content, head }: { content: string; head: keyof typeof chatHeads }) {
	const canvas = new Canvas(519, 142);
	canvas.context.imageSmoothingEnabled = false;

	const image = await canvas
		.addImage(textBoxFile, 0, 0)
		.addImage(chatHeads[head], 28, 21)
		.setTextAlign('center')
		.setTextFont('16px RuneScape Quill 8')

		.setColor('#810303')
		.addText(names[head], 307, 36)

		.setColor('#000')
		.addMultilineText(content, 307, 58, 361, 18)

		.toBufferAsync();

	return new MessageAttachment(image);
}
