import { formatItemStackQuantity, generateHexColorForCashStack } from '@oldschoolgg/toolkit/util';
import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import { calcWhatPercent, objectEntries } from 'e';
import type { Bank } from 'oldschooljs';
import { Util } from 'oldschooljs';

import { allCollectionLogs, getCollection, getTotalCl } from '../lib/data/Collections';
import type { IToReturnCollection } from '../lib/data/CollectionsExport';
import {
	type CanvasContext,
	canvasToBuffer,
	createCanvas,
	fillTextXTimesInCtx,
	getClippedRegion,
	measureTextWidth
} from '../lib/util/canvasUtil';
import getOSItem from '../lib/util/getOSItem';
import type { IBgSprite } from './bankImage';
import type { MUserStats } from './structures/MUserStats';

export const collectionLogTypes = [
	{ name: 'collection', description: 'Normal Collection Log' },
	{ name: 'sacrifice', description: 'Sacrificed Items Log' },
	{ name: 'bank', description: 'Owned Items Log' },
	{ name: 'temp', description: 'Temporary Log' }
] as const;
export type CollectionLogType = (typeof collectionLogTypes)[number]['name'];
export const CollectionLogFlags = [
	{ name: 'text', description: 'Show your CL in text format.' },
	{ name: 'missing', description: 'Show only missing items.' }
];

class CollectionLogTask {
	run() {}

	drawBorder(ctx: CanvasContext, sprite: IBgSprite) {
		return bankImageGenerator.drawBorder(ctx, sprite);
	}

	drawSquare(ctx: CanvasContext, x: number, y: number, w: number, h: number, pixelSize = 1, hollow = true) {
		ctx.save();
		if (hollow) {
			ctx.translate(0.5, 0.5);
			ctx.lineWidth = pixelSize;
			ctx.moveTo(x, y); // top left
			ctx.lineTo(w + x - pixelSize, y); // top right
			ctx.lineTo(w + x - pixelSize, y + h - pixelSize); // bottom right
			ctx.lineTo(x, y + h - pixelSize); // bottom left
			ctx.lineTo(x, y); // top left
			ctx.translate(-0.5, -0.5);
			ctx.stroke();
		} else {
			ctx.fillRect(x, y, w, h);
		}
		ctx.restore();
	}

	drawText(ctx: CanvasContext, text: string, x: number, y: number) {
		const baseFill = ctx.fillStyle;
		ctx.fillStyle = '#000000';
		fillTextXTimesInCtx(ctx, text, x + 1, y + 1);
		ctx.fillStyle = baseFill;
		fillTextXTimesInCtx(ctx, text, x, y);
	}

	drawLeftList(collectionLog: IToReturnCollection, sprite: IBgSprite) {
		if (!collectionLog.leftList) return;
		const leftHeight = Object.keys(collectionLog.leftList).length * 15; // 15 is the height of every list item
		const colors = {
			not_started: '#FF981F',
			started: '#FFFF00',
			completed: '#0DC10D',
			selected: '#6F675E',
			odd: sprite.oddListColor
		};

		// Create base canvas
		const canvasList = createCanvas(200, leftHeight);
		// Get the canvas context
		const ctxl = canvasList.getContext('2d');
		ctxl.font = '16px OSRSFontCompact';
		ctxl.imageSmoothingEnabled = false;
		let index = 0;
		let widestName = 0;

		for (const [name, status] of Object.entries(collectionLog.leftList)) {
			if (name === collectionLog.name) {
				ctxl.fillStyle = colors.selected;
			} else {
				ctxl.fillStyle = index % 2 === 0 ? colors.odd : 'transparent';
			}
			ctxl.fillRect(1, index * 15, canvasList.width, 15);
			ctxl.fillStyle = colors[status];
			const measuredName = ctxl.measureText(name).width;
			if (measuredName > widestName) widestName = measuredName;
			this.drawText(ctxl, name, 4, index * 15 + 13);
			index++;
		}

		return getClippedRegion(canvasList, 0, 0, widestName + 8, canvasList.height);
	}

	async generateLogImage(options: {
		user: MUser;
		collection: string;
		type: CollectionLogType;
		flags: { [key: string]: string | number | undefined };
		stats: MUserStats | null;
		collectionLog?: IToReturnCollection;
	}): Promise<CommandResponse> {
		const { sprite } = bankImageGenerator.getBgAndSprite(options.user.user.bankBackground, options.user);

		if (options.flags.temp) {
			options.type = 'temp';
		}
		const { collection, type, user, flags } = options;

		let collectionLog: IToReturnCollection | undefined | false = undefined;

		if (options.collectionLog) {
			collectionLog = options.collectionLog;
		}

		if (collection) {
			collectionLog = await getCollection({
				user,
				search: collection,
				flags,
				logType: type
			});
		}

		if (!collectionLog) {
			return {
				content: "That's not a valid collection log type."
			};
		}

		if (flags.text) {
			return {
				content: 'These are the items on your log:',
				files: [
					{
						attachment: Buffer.from(
							collectionLog.collection
								.map(i => {
									const _i = getOSItem(i);
									const _q = (collectionLog as IToReturnCollection).userItems.amount(_i.id);
									if (_q === 0 && !flags.missing) return undefined;
									return `${flags.nq || flags.missing ? '' : `${_q}x `}${_i.name}`;
								})
								.filter(f => f)
								.join(flags.comma ? ', ' : '\n')
						),
						name: 'yourLogItems.txt'
					}
				]
			};
		}

		// Disable tall flag when not showing left list
		if (flags.nl && flags.tall) {
			flags.tall = undefined;
		}

		const userCollectionBank = collectionLog.userItems;

		const fullSize = flags.nl || !collectionLog.leftList;

		const userTotalCl = getTotalCl(user, type, options.stats);
		const leftListCanvas = this.drawLeftList(collectionLog, sprite);

		let leftDivisor = 214;
		let rightArea = 276;
		let canvasWidth = 500;
		const itemSize = 36;

		let totalPrice = 0;

		if (collectionLog.category === collectionLog.name || flags.wide) {
			canvasWidth = 800;
		}
		if (leftListCanvas && !fullSize) {
			leftDivisor = leftListCanvas.width + 14;
			rightArea = canvasWidth - leftDivisor - 10;
		}
		if (fullSize) rightArea = canvasWidth - 20;

		// 13 is the spacing at the front (5px) + end (5px) + 2 pixels for the line + 1 pixels to move forward
		let maxPerLine = (rightArea - 13) / itemSize;
		if (maxPerLine - Math.floor(maxPerLine) > 0.5) maxPerLine = Math.floor(maxPerLine);
		else maxPerLine = Math.floor(maxPerLine) - 1;
		const itemSpacer = (rightArea - 13 - itemSize * maxPerLine) / (maxPerLine - 1);
		const canvasHeight = Math.max(
			317,
			Math.max(
				flags.tall ? (leftListCanvas ? 75 + leftListCanvas.height : 0) : 0,
				121 + (itemSize + itemSpacer) * Math.ceil(collectionLog.collectionTotal / maxPerLine)
			)
		);

		// Create base canvas
		const canvas = createCanvas(canvasWidth, canvasHeight);
		// Get the canvas context
		const ctx = canvas.getContext('2d');
		ctx.font = '16px OSRSFontCompact';
		ctx.imageSmoothingEnabled = false;

		// 69 = top border height + bottom border height + title space + tab space
		const boxHeight = ctx.canvas.height - 69;

		// Draw base background
		ctx.fillStyle = ctx.createPattern(sprite.repeatableBg, 'repeat')!;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		// Draw cl box lines
		this.drawBorder(ctx, sprite);
		ctx.strokeStyle = sprite.oddListColor;
		if (!fullSize) {
			this.drawSquare(ctx, 10, 59, ctx.canvas.width - 20, boxHeight);
			this.drawSquare(ctx, leftDivisor, 59, rightArea, 47);
			this.drawSquare(ctx, leftDivisor, 59, rightArea, boxHeight);
		} else {
			this.drawSquare(ctx, 10, 59, ctx.canvas.width - 20, boxHeight);
			this.drawSquare(ctx, 10, 59, ctx.canvas.width - 20, 47);
		}

		// Draw Title
		ctx.save();
		ctx.font = '16px RuneScape Bold 12';
		ctx.fillStyle = '#FF981F';
		const title = `${user.rawUsername}'s ${
			type === 'sacrifice' ? 'Sacrifice' : type === 'collection' ? 'Collection' : 'Bank'
		} Log - ${userTotalCl[1].toLocaleString()}/${userTotalCl[0].toLocaleString()} / ${calcWhatPercent(
			userTotalCl[1],
			userTotalCl[0]
		).toFixed(2)}%`;
		const titleX = ctx.canvas.width / 2 - ctx.measureText(title).width / 2;
		this.drawText(ctx, title, titleX, 22);
		ctx.restore();

		// Draw cl tabs
		let aclIndex = 0;
		ctx.save();
		for (const cl of Object.keys(allCollectionLogs)) {
			const x = aclIndex * sprite.tabBorderInactive.width + aclIndex * 6 + 10;
			ctx.drawImage(cl === collectionLog.category ? sprite.tabBorderActive : sprite.tabBorderInactive, x, 39);
			ctx.fillStyle = cl === collectionLog.category ? '#FFFFFF' : '#FF981F';
			this.drawText(
				ctx,
				cl,
				Math.floor(x + sprite.tabBorderInactive.width / 2 - ctx.measureText(cl).width / 2),
				39 + sprite.tabBorderInactive.height / 2 + 6 // 6 is to proper center the text
			);
			aclIndex++;
		}
		ctx.restore();
		// Draw items
		ctx.save();
		if (!fullSize) {
			ctx.translate(leftDivisor + 5, 110);
		} else {
			ctx.translate(15, 110);
		}
		let i = 0;
		let y = 0;
		for (const item of collectionLog.collection) {
			if (i > 0 && i % maxPerLine === 0) {
				i = 0;
				y += 1;
			}
			const itemImage = await bankImageGenerator.getItemImage(item, user);

			let qtyText = 0;
			if (!userCollectionBank.has(item)) {
				ctx.globalAlpha = 0.3;
			} else {
				qtyText = userCollectionBank.amount(item);
			}

			totalPrice += getOSItem(item).price * qtyText;

			if (flags.debug) {
				ctx.fillStyle = '#FF0000';
				ctx.fillRect(
					Math.floor(i * (itemSize + itemSpacer) + (itemSize - itemImage.width) / 2) + 2,
					Math.floor(y * (itemSize + itemSpacer) + (itemSize - itemImage.height) / 2),
					itemImage.width,
					itemImage.height
				);
			}
			ctx.drawImage(
				itemImage,
				Math.floor(i * (itemSize + itemSpacer) + (itemSize - itemImage.width) / 2) + 4,
				Math.floor(y * (itemSize + itemSpacer) + (itemSize - itemImage.height) / 2),
				itemImage.width,
				itemImage.height
			);

			if (qtyText > 0) {
				ctx.fillStyle = generateHexColorForCashStack(qtyText);
				this.drawText(
					ctx,
					formatItemStackQuantity(qtyText),
					Math.floor(i * (itemSize + itemSpacer) + (itemSize - itemImage.width) / 2) + 1,
					Math.floor(y * (itemSize + itemSpacer)) + 11
				);
			}

			ctx.globalAlpha = 1;
			i++;
		}
		ctx.restore();
		// Draw collection name
		ctx.save();
		if (!fullSize) {
			ctx.translate(leftDivisor + 5, 75);
		} else {
			ctx.translate(15, 75);
		}

		// Collection title
		ctx.font = '16px RuneScape Bold 12';
		ctx.fillStyle = '#FF981F';
		let effectiveName = collectionLog.name;
		if (!collectionLog.counts) {
			effectiveName = `${effectiveName} (Uncounted CL)`;
		}
		this.drawText(ctx, effectiveName, 0, 0);

		// Collection obtained items
		ctx.font = '16px OSRSFontCompact';
		const toDraw = flags.missing ? 'Missing: ' : type === 'sacrifice' ? 'Sacrificed: ' : 'Obtained: ';
		const obtainableMeasure = ctx.measureText(toDraw);
		this.drawText(ctx, toDraw, 0, 13);
		if (collectionLog.collectionTotal === collectionLog.collectionObtained) {
			ctx.fillStyle = '#00FF00';
		} else if (collectionLog.collectionObtained === 0) {
			ctx.fillStyle = '#FF0000';
		} else if (collectionLog.collectionTotal !== collectionLog.collectionObtained) {
			ctx.fillStyle = '#FFFF00';
		} else {
			ctx.fillStyle = '#FF981F';
		}
		this.drawText(
			ctx,
			`${
				flags.missing ? '' : `${collectionLog.collectionObtained.toLocaleString()}/`
			}${collectionLog.collectionTotal.toLocaleString()}`,
			Math.floor(obtainableMeasure.width),
			13
		);

		if (collectionLog.completions && ['collection', 'bank'].includes(type)) {
			let drawnSoFar = '';
			// Times done/killed
			ctx.font = '16px OSRSFontCompact';
			ctx.fillStyle = '#FF981F';
			this.drawText(ctx, (drawnSoFar = collectionLog.isActivity ? 'Completions: ' : 'Kills: '), 0, 25);
			let pixelLevel = 25;
			for (const [type, value] of objectEntries(collectionLog.completions)) {
				if (
					measureTextWidth(ctx, drawnSoFar) +
						measureTextWidth(ctx, ` / ${type}: `) +
						measureTextWidth(ctx, value.toLocaleString()) >=
					255
				) {
					pixelLevel += 10;
					drawnSoFar = '';
				}
				if (type !== 'Default') {
					ctx.fillStyle = '#FF981F';
					this.drawText(ctx, ` / ${type}: `, ctx.measureText(drawnSoFar).width, pixelLevel);
					drawnSoFar += ` / ${type}: `;
				}
				ctx.fillStyle = '#FFFFFF';
				this.drawText(ctx, value.toLocaleString(), ctx.measureText(drawnSoFar).width, pixelLevel);
				drawnSoFar += value.toLocaleString();
			}
			// TODO: Make looting count generic in future
			if (collectionLog.name === 'Guardians of the Rift') {
				ctx.fillStyle = '#FF981F';
				this.drawText(ctx, ' Rifts searches: ', ctx.measureText(drawnSoFar).width, pixelLevel);
				drawnSoFar += ' Rifts searches: ';
				ctx.fillStyle = '#FFFFFF';
				this.drawText(
					ctx,
					options.stats?.gotrRiftSearches.toLocaleString() ?? '',
					ctx.measureText(drawnSoFar).width,
					pixelLevel
				);
			}
		}

		ctx.restore();

		ctx.save();
		ctx.font = '16px OSRSFontCompact';
		ctx.fillStyle = generateHexColorForCashStack(totalPrice);
		const value = Util.toKMB(totalPrice);
		this.drawText(ctx, value, ctx.canvas.width - 15 - ctx.measureText(value).width, 75 + 25);
		ctx.restore();

		if (leftListCanvas && !fullSize) {
			if (!flags.tall) {
				let selectedPos = 8;
				const listItemSize = 15;
				for (const name of Object.keys(collectionLog.leftList!)) {
					if (name === collectionLog.name) break;
					selectedPos += listItemSize;
				}
				// Canvas height - top area until list starts - left area, where list should end
				const listHeightSpace = ctx.canvas.height - 62 - 13;

				// Check if in the start of the list
				if (selectedPos <= listHeightSpace || selectedPos > leftListCanvas.height) {
					ctx.drawImage(
						leftListCanvas,
						0,
						0,
						leftListCanvas.width,
						listHeightSpace,
						12,
						62,
						leftListCanvas.width,
						listHeightSpace
					);
				} else if (
					// Check if in the end of the list
					leftListCanvas.height - listHeightSpace <=
					selectedPos
				) {
					ctx.drawImage(
						leftListCanvas,
						0,
						leftListCanvas.height - listHeightSpace,
						leftListCanvas.width,
						leftListCanvas.height - (leftListCanvas.height - listHeightSpace),
						12,
						62,
						leftListCanvas.width,
						leftListCanvas.height - (leftListCanvas.height - listHeightSpace)
					);
				} else {
					// It is in the middle
					ctx.drawImage(
						leftListCanvas,
						0,
						selectedPos - Math.floor(listHeightSpace / 2),
						leftListCanvas.width,
						listHeightSpace,
						12,
						62,
						leftListCanvas.width,
						listHeightSpace
					);
				}
			} else {
				ctx.drawImage(leftListCanvas, 12, 62);
			}
		}

		return {
			files: [{ attachment: await canvasToBuffer(canvas), name: `${type}_log_${new Date().valueOf()}.png` }]
		};
	}

	async makeArbitraryCLImage({
		user,
		title,
		clItems,
		userBank
	}: {
		user: MUser;
		title: string;
		clItems: number[];
		userBank: Bank;
	}) {
		return this.generateLogImage({
			user,
			collection: '',
			type: 'bank',
			flags: {},
			stats: null,
			collectionLog: {
				name: title,
				collection: clItems,
				userItems: userBank,
				collectionTotal: clItems.length,
				collectionObtained: clItems.filter(i => userBank.has(i)).length,
				category: 'idk',
				leftList: undefined,
				counts: false
			}
		});
	}
}

export const clImageGenerator = new CollectionLogTask();
