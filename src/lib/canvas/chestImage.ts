import { randInt } from '@oldschoolgg/rng';
import { AttachmentBuilder } from 'discord.js';
import { type Bank, ItemGroups, resolveItems, toKMB } from 'oldschooljs';
import { type Image, loadImage } from 'skia-canvas';

import { TOBUniques } from '@/lib/data/tob.js';
import { bankImageTask } from './bankImage.js';
import type { CanvasImage } from './canvasUtil.js';
import { OSRSCanvas } from './OSRSCanvas.js';

const chestLootTypes: {
	title: string;
	chestImage: Promise<Image>;
	chestImagePurple: Promise<Image>;
	width: number;
	height: number;
	purpleItems: (number | string)[];
	position: (canvas: OSRSCanvas, image: CanvasImage) => [number, number];
	itemRect: [number, number, number, number];
}[] = [
	{
		title: 'Tombs of Amascut',
		chestImage: loadImage('./src/lib/resources/images/toaChest.png'),
		chestImagePurple: loadImage('./src/lib/resources/images/toaChestPurple.png'),
		width: 240,
		height: 220,
		purpleItems: ItemGroups.toaPurpleItems,
		position: (canvas: OSRSCanvas, image: CanvasImage) => [
			canvas.width - image.width + 25,
			44 + canvas.height / 4 - image.height / 2
		],
		itemRect: [21, 50, 120, 160]
	},
	{
		title: 'Theatre of Blood',
		chestImage: loadImage('./src/lib/resources/images/tobChest.png'),
		chestImagePurple: loadImage('./src/lib/resources/images/tobChestPurple.png'),
		width: 260,
		height: 180,
		purpleItems: TOBUniques,
		position: (canvas: OSRSCanvas, image: CanvasImage) => [
			canvas.width - image.width,
			55 + canvas.height / 4 - image.height / 2
		],
		itemRect: [21, 50, 120, 160]
	},
	{
		title: 'Chambers of Xerician',
		chestImage: loadImage('./src/lib/resources/images/cox.png'),
		chestImagePurple: loadImage('./src/lib/resources/images/cox.png'),
		width: 260,
		height: 180,
		purpleItems: resolveItems([
			'Metamorphic dust',
			'Twisted ancestral colour kit',
			"Xeric's guard",
			"Xeric's warrior",
			"Xeric's sentinel",
			"Xeric's general",
			"Xeric's champion",
			'Olmlet',
			'Twisted bow',
			'Elder maul',
			'Kodai insignia',
			'Dragon claws',
			'Ancestral hat',
			'Ancestral robe top',
			'Ancestral robe bottom',
			"Dinh's bulwark",
			'Dexterous prayer scroll',
			'Arcane prayer scroll',
			'Dragon hunter crossbow',
			'Twisted buckler'
		]),
		position: () => [12, 44],
		itemRect: [135, 45, 120, 120]
	},
	{
		title: 'Depths of Atlantis',
		chestImage: loadImage('./src/lib/resources/images/doa.png'),
		chestImagePurple: loadImage('./src/lib/resources/images/doa.png'),
		width: 260,
		height: 180,
		purpleItems: [70420, 70441, 70425, 70426, 70428, 70437, 70438, 70439, 70440],
		position: () => [12, 44],
		itemRect: [135, 45, 120, 120]
	}
] as const;

interface CustomText {
	x: number;
	y: number;
	text: string;
}

interface ChestLootEntry {
	previousCL: Bank;
	user: MUser;
	loot: Bank;
	customTexts: CustomText[];
}

async function drawSingleChestCanvas(
	entry: ChestLootEntry,
	type: (typeof chestLootTypes)[number]
): Promise<{ canvas: OSRSCanvas; isPurple: boolean }> {
	const { previousCL, loot, user, customTexts } = entry;
	const { sprite } = bankImageTask.getBgAndSprite({ bankBackgroundId: user.user.bankBackground });

	const canvas = new OSRSCanvas({
		width: type.width,
		height: type.height,
		sprite,
		iconPackId: user.iconPackId
	});

	canvas.ctx.fillStyle = canvas.ctx.createPattern(sprite.repeatableBg, 'repeat')!;
	canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);

	const isPurple = loot.items().some(([item]) => type.purpleItems.includes(item.id));
	const chestImage = isPurple ? await type.chestImagePurple : await type.chestImage;
	const [x, y] = type.position(canvas, chestImage);

	canvas.ctx.drawImage(chestImage, x, y);

	canvas.drawTitleText({
		text: `${user.rawUsername} (${toKMB(loot.value())})`,
		x: canvas.width / 2,
		y: 21,
		center: true
	});

	canvas.drawBorder(sprite, true);

	await drawChestItems(canvas, loot, previousCL, user, type);

	for (const customText of customTexts) {
		canvas.drawText({
			text: customText.text,
			x: customText.x,
			y: customText.y,
			color: '#FFFF00'
		});
	}

	return { canvas, isPurple };
}

async function drawChestItems(
	canvas: OSRSCanvas,
	loot: Bank,
	previousCL: Bank,
	user: MUser,
	type: (typeof chestLootTypes)[number]
): Promise<void> {
	const xOffset = 10;
	const yOffset = 45;
	const [iX, iY, iW, iH] = type.itemRect;

	const itemCanvas = new OSRSCanvas({ width: iW + xOffset, height: iH + yOffset });

	await bankImageTask.drawItems(
		itemCanvas,
		false, // compact
		5, // spacer
		2, // itemsPerRow
		55, // itemWidthSize
		loot.items(),
		new Map().set('showNewCL', true),
		previousCL,
		undefined, // mahojiFlags
		undefined, // weightings
		5, // verticalSpacer
		user
	);

	// Draw the item canvas onto the main canvas
	canvas.ctx.drawImage(itemCanvas.getCanvas(), iX - xOffset, iY - yOffset);
}

function combineCanvases(canvases: OSRSCanvas[]): OSRSCanvas {
	const spaceBetweenImages = 15;
	const totalWidth = canvases[0].width * canvases.length + spaceBetweenImages * canvases.length;
	const totalHeight = canvases[0].height;

	const combinedCanvas = new OSRSCanvas({
		width: totalWidth,
		height: totalHeight,
		sprite: canvases[0].sprite
	});

	for (const [index, canvas] of canvases.entries()) {
		const xPosition = index * canvas.width + spaceBetweenImages * index;
		combinedCanvas.ctx.drawImage(canvas.getCanvas(), xPosition, 0);
	}

	return combinedCanvas;
}

export async function drawChestLootImage(options: {
	entries: ChestLootEntry[];
	type: (typeof chestLootTypes)[number]['title'];
}): Promise<AttachmentBuilder> {
	const type = chestLootTypes.find(t => t.title === options.type);
	if (!type) {
		throw new Error(`Invalid chest type: ${options.type}`);
	}

	const canvasResults: { canvas: OSRSCanvas; isPurple: boolean }[] = [];

	for (const entry of options.entries) {
		const result = await drawSingleChestCanvas(entry, type);
		canvasResults.push(result);
	}

	const anyoneGotPurple = canvasResults.some(result => result.isPurple);
	const fileName = `${anyoneGotPurple ? 'SPOILER_' : ''}${type.title.toLowerCase().replace(/\s+/g, '')}-${randInt(1, 1000)}.png`;

	if (canvasResults.length === 1) {
		const imageBuffer = await canvasResults[0].canvas.toScaledOutput(2);
		return new AttachmentBuilder(imageBuffer, { name: fileName });
	}

	const canvases = canvasResults.map(result => result.canvas);
	const combinedCanvas = combineCanvases(canvases);
	const combinedBuffer = await combinedCanvas.toScaledOutput(2);

	return new AttachmentBuilder(combinedBuffer, { name: fileName });
}
