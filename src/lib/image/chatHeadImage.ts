import { registerFont } from 'canvas';
import { Canvas } from 'canvas-constructor';
import * as fs from 'fs';

registerFont('./resources/osrs-font-quill-8.ttf', { family: 'Regular' });

const textBoxFile = fs.readFileSync('./resources/images/textbox.png');

export default function chatHeadImage({
	id,
	content,
	name
}: {
	id: number;
	content: string;
	name: string;
}) {
	const canvas = new Canvas(519, 142);
	canvas.context.imageSmoothingEnabled = false;

	const chatImage = fs.readFileSync(`./resources/images/chat_heads/${id}.png`);

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
