const {
	util: { chunk }
} = require('klasa');
const { Items } = require('oldschooljs');
const { createCanvas, Image, registerFont } = require('canvas');
const fs = require('fs');

/* Setup Image Generation */

const bg = fs.readFileSync('./resources/images/bank.png');

registerFont('./resources/osrs-font.ttf', { family: 'Regular' });
registerFont('./resources/osrs-font-compact.otf', { family: 'Regular' });

const CANVAS_WIDTH = 488;
const CANVAS_HEIGHT = 331;
const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const ctx = canvas.getContext('2d');
ctx.font = '16px OSRSFontCompact';
ctx.imageSmoothingEnabled = false;

const items = [];

const fileNames = fs.readdirSync(`./resources/item-images/`);

for (const itemID of fileNames.map(fileName => fileName.split('.')[0])) {
	const file = fs.readFileSync(`./resources/item-images/${itemID}.png`);
	const iconImage = new Image();
	iconImage.src = file;

	const itemData = Items.get(parseInt(itemID));

	items.push({
		...itemData,
		image: iconImage
	});
}

/*
loot = {
    itemID: itemQuantity
}
*/

function generateBankImageFromLoot(itemLoot) {
	ctx.fillStyle = '#494034';
	const BG = new Image();
	BG.src = bg;
	ctx.drawImage(BG, 0, 0, BG.width, BG.height);

	let loot = [];

	for (const [id, lootQuantity] of Object.entries(itemLoot)) {
		loot.push({
			id: parseInt(id),
			quantity: lootQuantity
		});
	}

	loot = loot.filter(item => item.quantity > 0);
	if (loot.length === 0) throw 'No loot!';

	const chunkedLoot = chunk(loot, 8);
	const spacer = 12;
	const itemSize = 32;
	const distanceFromTop = 32;
	const distanceFromSide = 16;

	for (let i = 0; i < chunkedLoot.length; i++) {
		for (let x = 0; x < chunkedLoot[i].length; x++) {
			const { id, quantity } = chunkedLoot[i][x];
			const item = items.find(_i => _i.id === parseInt(id));
			if (!item) {
				continue;
			}
			const xLoc = Math.floor(spacer + x * ((CANVAS_WIDTH - 40) / 8) + distanceFromSide);
			const yLoc = Math.floor(itemSize * (i * 1.1) + spacer + distanceFromTop);

			ctx.drawImage(
				item.image,
				xLoc + (32 - item.image.width) / 2,
				yLoc + (32 - item.image.height) / 2,
				item.image.width,
				item.image.height
			);

			/*
			ctx.strokeRect(
				xLoc + (32 - item.image.width) / 2,
				yLoc + (32 - item.image.height) / 2,
				item.image.width,
				item.image.height
			);
			*/

			let formattedQuantity;
			let quantityColor = '#FFFF00';
			if (quantity > 9999999) {
				formattedQuantity = `${Math.floor(quantity / 1000000)}M`;
				quantityColor = '#00FF80';
			} else if (quantity > 99999) {
				formattedQuantity = `${Math.floor(quantity / 1000)}K`;
				quantityColor = '#FFFFFF';
			} else {
				formattedQuantity = quantity.toString();
			}

			ctx.fillStyle = '#000000';
			for (let t = 0; t < 5; t++) {
				ctx.fillText(
					formattedQuantity,
					xLoc + distanceFromSide - 16 + 1,
					yLoc + distanceFromTop - 24 + 1
				);
			}

			ctx.fillStyle = quantityColor;
			for (let t = 0; t < 5; t++) {
				ctx.fillText(
					formattedQuantity,
					xLoc + distanceFromSide - 16,
					yLoc + distanceFromTop - 24
				);
			}
		}
	}

	const test = canvas.toBuffer();
	return test;
}

module.exports = generateBankImageFromLoot;
