import { registerFont } from 'canvas';
import { Canvas } from 'canvas-constructor';
import * as fs from 'fs';

registerFont('./resources/osrs-font-quill-8.ttf', { family: 'Regular' });

const textBoxFile = fs.readFileSync('./resources/images/textbox.png');
const mejJalChatHead = fs.readFileSync('./resources/images/mejJal.png');

export default function chatHeadImage({ content, name }: { content: string; name: string }) {
	const canvas = new Canvas(519, 142);
	canvas.context.imageSmoothingEnabled = false;

	return canvas
		.addImage(textBoxFile, 0, 0)
		.addImage(mejJalChatHead, 28, 21)
		.setTextAlign('center')
		.setTextFont('16px RuneScape Quill 8')

		.setColor('#810303')
		.addText(name, 307, 36)

		.setColor('#000')
		.addMultilineText(content, 307, 58, 361, 18)

		.toBufferAsync();
}
