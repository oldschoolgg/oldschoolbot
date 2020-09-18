import { registerFont } from 'canvas';
import { Canvas } from 'canvas-constructor';
import * as fs from 'fs';

registerFont('./resources/osrs-font-quill-8.ttf', { family: 'Regular' });

const textBoxFile = fs.readFileSync('./resources/images/textbox.png');

const ChatHeads: { [key: string]: Buffer } = {
	Jad: fs.readFileSync('./resources/images/mejJal.png'),
	GuildmasterJane: fs.readFileSync('./resources/images/guildmasterJaneImage.png')
};

export default function chatHeadImage({
	npc,
	content,
	name
}: {
	npc: string;
	content: string;
	name: string;
}) {
	const canvas = new Canvas(519, 142);
	canvas.context.imageSmoothingEnabled = false;

	const chatImage = ChatHeads[npc];

	return canvas
		.addImage(textBoxFile, 0, 0)
		.addImage(chatImage, 28, 21)
		.setTextAlign('center')
		.setTextFont('16px RuneScape Quill 8')

		.setColor('#810303')
		.addText(name, 307, 36)

		.setColor('#000')
		.addMultilineText(content, 307, 58, 361, 18)

		.toBufferAsync();
}
