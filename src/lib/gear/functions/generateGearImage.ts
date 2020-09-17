/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { createCanvas } from 'canvas';
import * as fs from 'fs';
import { KlasaClient } from 'klasa';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearTypes } from '..';
import { canvasImageFromBuffer } from '../../util';
import { drawItemQuantityText } from '../../util/drawItemQuantityText';
import { drawTitleText } from '../../util/drawTitleText';
import readableGearTypeName from './readableGearTypeName';

const gearTemplateFile = fs.readFileSync('./resources/images/gear_template.png');

/**
 * The default gear in a gear setup, when nothing is equipped.
 */
const slotCoordinates: { [key in EquipmentSlot]: [number, number] } = {
	[EquipmentSlot.TwoHanded]: [10, 115],
	[EquipmentSlot.Ammo]: [107, 76],
	[EquipmentSlot.Body]: [66, 115],
	[EquipmentSlot.Cape]: [25, 76],
	[EquipmentSlot.Feet]: [66, 195],
	[EquipmentSlot.Hands]: [8, 195],
	[EquipmentSlot.Head]: [66, 36],
	[EquipmentSlot.Legs]: [66, 154],
	[EquipmentSlot.Neck]: [65, 76],
	[EquipmentSlot.Ring]: [122, 195],
	[EquipmentSlot.Shield]: [122, 115],
	[EquipmentSlot.Weapon]: [10, 115]
};

const slotSize = 36;

export async function generateGearImage(
	client: KlasaClient,
	gearSetup: GearTypes.GearSetup,
	gearType: GearTypes.GearSetupTypes,
	petID: number | null
) {
	const gearTemplateImage = await canvasImageFromBuffer(gearTemplateFile);
	const canvas = createCanvas(gearTemplateImage.width, gearTemplateImage.height);
	const ctx = canvas.getContext('2d');
	ctx.font = '16px OSRSFontCompact';
	ctx.imageSmoothingEnabled = false;

	ctx.drawImage(gearTemplateImage, 0, 0, gearTemplateImage.width, gearTemplateImage.height);

	drawTitleText(ctx, readableGearTypeName(gearType), Math.floor(canvas.width / 2), 17);
	// Draw Items

	if (petID) {
		const image = await client.tasks.get('bankImage')!.getItemImage(petID);
		ctx.drawImage(
			image,
			173 + slotSize / 2 - image.width / 2,
			195 + slotSize / 2 - image.height / 2,
			image.width,
			image.height
		);
	}

	for (const enumName of Object.values(EquipmentSlot)) {
		const item = gearSetup[enumName];
		if (!item) continue;
		const image = await client.tasks.get('bankImage')!.getItemImage(item.item);

		const [x, y] = slotCoordinates[enumName];

		ctx.drawImage(
			image,
			x + slotSize / 2 - image.width / 2,
			y + slotSize / 2 - image.height / 2,
			image.width,
			image.height
		);

		if (item.quantity > 1) {
			drawItemQuantityText(ctx, item.quantity, x + 1, y + 9);
		}
	}

	return canvas.toBuffer();
}
