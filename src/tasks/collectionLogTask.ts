import { Canvas, CanvasRenderingContext2D, createCanvas, Image } from 'canvas';
import { MessageAttachment, MessageOptions } from 'discord.js';
import { objectEntries } from 'e';
import fs from 'fs';
import { KlasaUser, Task } from 'klasa';

import { Events } from '../lib/constants';
import { allCollectionLogs, getCollection, getPossibleOptions, getTotalCl } from '../lib/data/Collections';
import { IToReturnCollection } from '../lib/data/CollectionsExport';
import bankBackgrounds from '../lib/minions/data/bankBackgrounds';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { formatItemStackQuantity, generateHexColorForCashStack } from '../lib/util';
import { canvasImageFromBuffer, fillTextXTimesInCtx } from '../lib/util/canvasUtil';
import getOSItem from '../lib/util/getOSItem';
import { logError } from '../lib/util/logError';
import BankImageTask from './bankImage';

interface ISprite {
	image: string;
	oddListColor: string;
	border: Canvas;
	borderCorner: Canvas;
	borderTitle: Canvas;
	tabBorderActive: Canvas;
	tabBorderInactive: Canvas;
	scrollArrow: Canvas;
	scrollBarEnd: Canvas;
	scrollBarOn: Canvas;
	scrollBarOff: Canvas;
	repeatableBg: Canvas;
}

export default class CollectionLogTask extends Task {
	private clSprite: Image = new Image();

	// css = Collection Log Spreadsheet
	private cls = <ISprite>{
		image: './src/lib/resources/images/bank_backgrounds/spritesheet/Default.png',
		oddListColor: '#655741'
	};

	private clsDark = <ISprite>{
		image: './src/lib/resources/images/bank_backgrounds/spritesheet/Dark.png',
		oddListColor: '#393939'
	};

	private scls = <ISprite>{};

	async init() {
		for (const cls of [this.cls, this.clsDark]) {
			this.clSprite = await canvasImageFromBuffer(fs.readFileSync(cls.image));
			cls.border = this.getClippedRegion(this.clSprite, 0, 0, 18, 6);
			cls.borderCorner = this.getClippedRegion(this.clSprite, 19, 0, 6, 6);
			cls.borderTitle = this.getClippedRegion(this.clSprite, 26, 0, 18, 6);
			cls.tabBorderInactive = this.getClippedRegion(this.clSprite, 0, 7, 75, 20);
			cls.tabBorderActive = this.getClippedRegion(this.clSprite, 0, 45, 75, 20);
			cls.scrollArrow = this.getClippedRegion(this.clSprite, 0, 28, 16, 16);
			cls.scrollBarEnd = this.getClippedRegion(this.clSprite, 17, 28, 16, 6);
			cls.scrollBarOn = this.getClippedRegion(this.clSprite, 17, 35, 16, 1);
			cls.scrollBarOff = this.getClippedRegion(this.clSprite, 17, 37, 16, 1);
			cls.repeatableBg = this.getClippedRegion(this.clSprite, 93, 0, 96, 65);
		}
	}

	run() {}

	// Split sprite into smaller images by coors and size
	getClippedRegion(image: Image | Canvas, x: number, y: number, width: number, height: number) {
		const canvas = createCanvas(0, 0);
		const ctx = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
		return canvas;
	}

	drawBorder(ctx: CanvasRenderingContext2D) {
		// Top border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(this.scls.border, 'repeat-y');
		ctx.translate(0, 0);
		ctx.scale(1, 1);
		ctx.fillRect(0, 0, ctx.canvas.width, this.scls.border.height);
		ctx.restore();
		// Bottom border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(this.scls.border, 'repeat-y');
		ctx.translate(0, ctx.canvas.height);
		ctx.scale(1, -1);
		ctx.fillRect(0, 0, ctx.canvas.width, this.scls.border.height);
		ctx.restore();
		// Right border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(this.scls.border, 'repeat-x');
		ctx.rotate((Math.PI / 180) * 90);
		ctx.translate(0, -ctx.canvas.width);
		ctx.fillRect(0, 0, ctx.canvas.height, this.scls.border.height);
		ctx.restore();
		// Left border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(this.scls.border, 'repeat-x');
		ctx.rotate((Math.PI / 180) * 90);
		ctx.scale(1, -1);
		ctx.fillRect(0, 0, ctx.canvas.height, this.scls.border.height);
		ctx.restore();
		// Corners
		// Top left
		ctx.save();
		ctx.scale(1, 1);
		ctx.drawImage(this.scls.borderCorner, 0, 0);
		ctx.restore();
		// Top right
		ctx.save();
		ctx.translate(ctx.canvas.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(this.scls.borderCorner, 0, 0);
		ctx.restore();
		// Bottom right
		ctx.save();
		ctx.translate(ctx.canvas.width, ctx.canvas.height);
		ctx.scale(-1, -1);
		ctx.drawImage(this.scls.borderCorner, 0, 0);
		ctx.restore();
		// Bottom left
		ctx.save();
		ctx.translate(0, ctx.canvas.height);
		ctx.scale(1, -1);
		ctx.drawImage(this.scls.borderCorner, 0, 0);
		ctx.restore();
		// Title border
		ctx.save();
		ctx.fillStyle = ctx.createPattern(this.scls.borderTitle, 'repeat-y');
		ctx.translate(this.scls.border.height - 1, 29);
		ctx.fillRect(0, 0, ctx.canvas.width - this.scls.border.height * 2 + 2, this.scls.borderTitle.height);
		ctx.restore();
	}

	drawSquare(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number,
		pixelSize: number = 1,
		hollow: boolean = true
	) {
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

	drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
		const baseFill = ctx.fillStyle;
		ctx.fillStyle = '#000000';
		fillTextXTimesInCtx(ctx, text, x + 1, y + 1);
		ctx.fillStyle = baseFill;
		fillTextXTimesInCtx(ctx, text, x, y);
	}

	drawLeftList(collectionLog: IToReturnCollection) {
		if (!collectionLog.leftList) return;
		const leftHeight = Object.keys(collectionLog.leftList).length * 15; // 15 is the height of every list item
		const colors = {
			not_started: '#FF981F',
			started: '#FFFF00',
			completed: '#0DC10D',
			selected: '#6F675E',
			odd: this.scls.oddListColor
		};

		// Create base canvas
		const canvasList = createCanvas(200, leftHeight);
		// Get the canvas context
		const ctxl = canvasList.getContext('2d');
		ctxl.font = '16px OSRSFontCompact';
		ctxl.textAlign = 'left';
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

		return this.getClippedRegion(canvasList, 0, 0, widestName + 8, canvasList.height);
	}

	async generateLogImage(options: {
		user: KlasaUser;
		collection: string;
		type: 'collection' | 'sacrifice' | 'bank' | 'temp';
		flags: { [key: string]: string | number };
	}): Promise<MessageOptions | MessageAttachment> {
		if (options.flags.temp) {
			options.type = 'temp';
		}
		let { collection, type, user, flags } = options;

		await user.settings.sync(true);

		let collectionLog: IToReturnCollection | undefined | false = undefined;

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
				content: "That's not a valid collection log type. The valid types are: ",
				files: [getPossibleOptions()]
			};
		}

		if (flags.text) {
			return {
				content: 'This is the items on your log:',
				files: [
					new MessageAttachment(
						Buffer.from(
							collectionLog.collection
								.map(i => {
									let _i = getOSItem(i);
									const _q = (collectionLog as IToReturnCollection).userItems.amount(_i.id);
									if (_q === 0 && !flags.missing) return undefined;
									return `${flags.nq || flags.missing ? '' : `${_q}x `}${_i.name}`;
								})
								.filter(f => f)
								.join(flags.comma ? ', ' : '\n')
						),
						'yourLogItems.txt'
					)
				]
			};
		}

		// Disable tall flag when not showing left list
		if (flags.nl && flags.tall) {
			delete flags.tall;
		}

		const userBgID = user.settings.get(UserSettings.BankBackground) ?? 1;
		this.scls = this.cls;
		if (userBgID === bankBackgrounds.find(b => b.name === 'Dark')!.id) this.scls = this.clsDark;

		const userCollectionBank = collectionLog.userItems;

		const fullSize = flags.nl || !collectionLog.leftList;

		const userTotalCl = getTotalCl(user, type);
		const leftListCanvas = this.drawLeftList(collectionLog);

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
		ctx.fillStyle = ctx.createPattern(this.scls.repeatableBg, 'repeat');
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		// Draw cl box lines
		this.drawBorder(ctx);
		ctx.strokeStyle = this.scls.oddListColor;
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
		ctx.textAlign = 'center';
		this.drawText(
			ctx,
			`${user.username}'s ${
				type === 'sacrifice' ? 'Sacrifice' : type === 'collection' ? 'Collection' : 'Bank'
			} Log - ${userTotalCl[1].toLocaleString()}/${userTotalCl[0].toLocaleString()}`,
			ctx.canvas.width / 2,
			22
		);
		ctx.restore();

		// Draw cl tabs
		let aclIndex = 0;
		ctx.save();
		for (const cl of Object.keys(allCollectionLogs)) {
			const x = aclIndex * this.scls.tabBorderInactive.width + aclIndex * 6 + 10;
			ctx.drawImage(
				cl === collectionLog.category ? this.scls.tabBorderActive : this.scls.tabBorderInactive,
				x,
				39
			);
			ctx.fillStyle = cl === collectionLog.category ? '#FFFFFF' : '#FF981F';
			ctx.textAlign = 'center';
			this.drawText(
				ctx,
				cl,
				x + this.scls.tabBorderInactive.width / 2,
				39 + this.scls.tabBorderInactive.height / 2 + 6 // 6 is to proper center the text
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
			const itemImage = await (this.client.tasks.get('bankImage') as BankImageTask)
				.getItemImage(item, 1)
				.catch(() => {
					logError(`Failed to load item image for item with id: ${item}`);
				});
			if (!itemImage) {
				this.client.emit(Events.Warn, `Item with ID[${item}] has no item image.`);
				continue;
			}

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
			obtainableMeasure.width,
			13
		);

		if (collectionLog.completions && ['collection', 'bank'].includes(type)) {
			let drawnSoFar = '';
			// Times done/killed
			ctx.font = '16px OSRSFontCompact';
			ctx.textAlign = 'left';
			ctx.fillStyle = '#FF981F';
			this.drawText(ctx, (drawnSoFar = collectionLog.isActivity ? 'Completions: ' : 'Kills: '), 0, 25);
			let pixelLevel = 25;
			for (let [type, value] of objectEntries(collectionLog.completions)) {
				if (
					ctx.measureText(drawnSoFar).width +
						ctx.measureText(` / ${type}: `).width +
						ctx.measureText(value.toLocaleString()).width >=
					225
				) {
					pixelLevel += 10;
					drawnSoFar = '';
				}
				if (type !== 'Default') {
					if (value === 0) continue;
					ctx.fillStyle = '#FF981F';
					this.drawText(ctx, ` / ${type}: `, ctx.measureText(drawnSoFar).width, pixelLevel);
					drawnSoFar += ` / ${type}: `;
				}
				ctx.fillStyle = '#FFFFFF';
				this.drawText(ctx, value.toLocaleString(), ctx.measureText(drawnSoFar).width, pixelLevel);
				drawnSoFar += value.toLocaleString();
			}
		}
		ctx.restore();
		// Total value of the selected activity/tab
		// Times done/killed
		ctx.save();
		ctx.font = '16px OSRSFontCompact';
		ctx.textAlign = 'right';
		ctx.fillStyle = generateHexColorForCashStack(Math.round(totalPrice));
		this.drawText(ctx, Math.round(totalPrice).toLocaleString(), ctx.canvas.width - 15, 75 + 25);
		ctx.fillStyle = '#FF981F';
		this.drawText(
			ctx,
			'Value: ',
			ctx.canvas.width - 12 - ctx.measureText(`${Math.round(totalPrice).toLocaleString()} `).width,
			75 + 25
		);
		ctx.restore();
		if (leftListCanvas && !fullSize) {
			if (!Boolean(flags.tall)) {
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

		return new MessageAttachment(canvas.toBuffer('image/png'), `${type}_log_${new Date().valueOf()}.png`);
	}
}
