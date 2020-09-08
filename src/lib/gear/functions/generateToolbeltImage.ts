/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as fs from 'fs';
import { KlasaClient } from 'klasa';
import { createCanvas } from 'canvas';

import { canvasImageFromBuffer, itemID, itemNameFromID } from '../../util';
import { drawTitleText } from '../../util/drawTitleText';
import { Bank } from '../../types';

const toolbeltTemplateFile = fs.readFileSync('./resources/images/toolbelt_template.png');

const slotCoordinates = {
	[itemID('Bronze pickaxe')]: [11, 72],
	[itemID('Bronze axe')]: [49, 72],
	[itemID('3rd age pickaxe')]: [-100, -100],
	[itemID('Crystal pickaxe')]: [-100, -100],
	[itemID('Infernal pickaxe')]: [-100, -100],
	[itemID('Dragon pickaxe')]: [-100, -100],
	[itemID('3rd age axe')]: [-100, -100],
	[itemID('Crystal axe')]: [-100, -100],
	[itemID('Infernal axe')]: [-100, -100],
	[itemID('Dragon axe')]: [-100, -100],
	[itemID('Crystal saw')]: [-100, -100],
	[itemID('Saw')]: [87, 72],
	[itemID('Magic butterfly net')]: [11, 119],
	[itemID('Butterfly net')]: [-100, -100],
	[itemID('Magic secateurs')]: [-100, -100],
	[itemID('Secateurs')]: [11, 166],
	[itemID("Gricoller's can")]: [-100, -100],
	[itemID('Watering can(8)')]: [49, 166],
	[itemID('Crystal harpoon')]: [-100, -100],
	[itemID('Dragon harpoon')]: [-100, -100],
	[itemID('Harpoon')]: [11, 213]
};

const pickaxes = ['3rd age pickaxe', 'Crystal pickaxe', 'Infernal pickaxe', 'Dragon pickaxe'];
const axes = ['3rd age axe', 'Crystal axe', 'Infernal axe', 'Dragon axe'];
const saws = ['Crystal saw', 'Saw'];
const secateurs = ['Magic secateurs', 'Secateurs'];
const wateringCans = ["Gricoller's can", 'Watering can(8)'];
const harpoons = ['Crystal harpoon', 'Dragon harpoon', 'Harpoon'];
const nets = ['Magic butterfly net', 'Butterfly net'];

const slotSize = 36;

export async function generateToolbeltImage(client: KlasaClient, toolBelt: Bank) {
	for (const pickaxe of pickaxes) {
		if (Object.keys(toolBelt).some(x => itemNameFromID(parseInt(x)) === pickaxe)) {
			slotCoordinates[itemID(`Bronze pickaxe`)] = [-100, -100];
			slotCoordinates[itemID(pickaxe)] = [11, 72];
			break;
		}
	}
	for (const axe of axes) {
		if (Object.keys(toolBelt).some(x => itemNameFromID(parseInt(x)) === axe)) {
			slotCoordinates[itemID(`Bronze axe`)] = [-100, -100];
			slotCoordinates[itemID(axe)] = [49, 72];
			break;
		}
	}
	for (const saw of saws) {
		if (Object.keys(toolBelt).some(x => itemNameFromID(parseInt(x)) === saw)) {
			slotCoordinates[itemID(`Saw`)] = [-100, -100];
			slotCoordinates[itemID(saw)] = [87, 72];
			break;
		}
	}
	for (const secateur of secateurs) {
		if (Object.keys(toolBelt).some(x => itemNameFromID(parseInt(x)) === secateur)) {
			slotCoordinates[itemID(`Secateurs`)] = [-100, -100];
			slotCoordinates[itemID(secateur)] = [11, 166];
			break;
		}
	}
	for (const can of wateringCans) {
		if (Object.keys(toolBelt).some(x => itemNameFromID(parseInt(x)) === can)) {
			slotCoordinates[itemID(`Watering can(8)`)] = [-100, -100];
			slotCoordinates[itemID(can)] = [49, 166];

			break;
		}
	}
	for (const harpoon of harpoons) {
		if (Object.keys(toolBelt).some(x => itemNameFromID(parseInt(x)) === harpoon)) {
			slotCoordinates[itemID(`Harpoon`)] = [-100, -100];
			slotCoordinates[itemID(harpoon)] = [11, 213];
			break;
		}
	}
	for (const net of nets) {
		if (Object.keys(toolBelt).some(x => itemNameFromID(parseInt(x)) === net)) {
			slotCoordinates[itemID(`Butterfly net`)] = [-100, -100];
			slotCoordinates[itemID(net)] = [11, 119];
			break;
		}
	}

	const toolbeltTemplateImage = await canvasImageFromBuffer(toolbeltTemplateFile);
	const canvas = createCanvas(toolbeltTemplateImage.width, toolbeltTemplateImage.height);
	const ctx = canvas.getContext('2d');
	ctx.font = '16px OSRSFontCompact';
	ctx.imageSmoothingEnabled = false;

	ctx.drawImage(
		toolbeltTemplateImage,
		0,
		0,
		toolbeltTemplateImage.width,
		toolbeltTemplateImage.height
	);

	drawTitleText(ctx, 'Toolbelt', Math.floor(canvas.width / 2), 17);

	for (const id of Object.keys(toolBelt)) {
		const image = await client.tasks.get('bankImage')!.getItemImage(parseInt(id));
		const [x, y] = slotCoordinates[parseInt(id)];

		ctx.drawImage(
			image,
			x + slotSize / 2 - image.width / 2,
			y + slotSize / 2 - image.height / 2,
			image.width,
			image.height
		);
	}

	return canvas.toBuffer();
}
