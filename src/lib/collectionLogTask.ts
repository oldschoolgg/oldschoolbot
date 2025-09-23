import { calcWhatPercent, objectEntries } from '@oldschoolgg/toolkit';
import { generateHexColorForCashStack } from '@oldschoolgg/toolkit/runescape';
import { toTitleCase } from '@oldschoolgg/toolkit/string-util';
import { type Bank, Items, toKMB } from 'oldschooljs';

import { allCollectionLogs, getCollection, getTotalCl } from '@/lib/data/Collections.js';
import type { CollectionStatus, IToReturnCollection } from '@/lib/data/CollectionsExport.js';
import type { MUserStats } from '@/lib/structures/MUserStats.js';
import { OSRSCanvas } from './canvas/OSRSCanvas.js';
import { bankImageTask } from './canvas/bankImage.js';
import type { IBgSprite } from './canvas/canvasUtil.js';

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
	COLORS = {
		ORANGEY: '#FF981F',
		WHITE: '#FFFFFF',
		TABS: {
			SELECTED_TAB: '#FFFFFF',
			UNSELECTED_TAB: '#FF981F'
		},
		PAGE_TITLE: {
			NOT_STARTED: '#FF0000',
			COMPLETED: '#00FF00',
			PARTIAL_COMPLETION: '#FFFF00'
		}
	};

	private parseClPageName(name: string): string {
		if (name === 'Thermonuclear smoke devil') return 'Thermy';
		return name.replace('Treasure Trail ', '').replace(' and ', ' & ');
	}

	drawLeftList(collectionLog: IToReturnCollection, sprite: IBgSprite) {
		if (!collectionLog.leftList) return;
		const ITEM_HEIGHT = 15;
		const leftHeight = Object.keys(collectionLog.leftList).length * ITEM_HEIGHT;
		const colors = {
			not_started: '#FF981F',
			started: '#FFFF00',
			completed: '#0DC10D',
			selected: '#6F675E',
			odd: sprite.oddListColor
		};

		const _canvas = new OSRSCanvas({ width: 200, height: leftHeight });
		let index = 0;
		let widestNameLength = 0;

		const entries: [string, CollectionStatus][] = Object.entries(collectionLog.leftList).map(([name, status]) => [
			this.parseClPageName(name),
			status
		]);

		for (const [clPageName] of entries) {
			const measuredName = _canvas.measureTextWidth(clPageName);
			if (measuredName > widestNameLength) {
				widestNameLength = measuredName;
			}
		}
		_canvas.setWidth(Math.min(widestNameLength, 150) + 8);

		for (const [clPageName, status] of entries) {
			const color =
				clPageName === this.parseClPageName(collectionLog.name)
					? colors.selected
					: index % 2 === 0
						? colors.odd
						: 'transparent';
			_canvas.drawSquare(1, index * ITEM_HEIGHT, _canvas.width, ITEM_HEIGHT, color);

			_canvas.drawText({
				text: clPageName,
				x: 4,
				y: index * ITEM_HEIGHT + 13,
				color: colors[status]
			});
			index++;
		}

		return _canvas;
	}

	async generateLogImage(options: {
		user: MUser;
		collection: string;
		type: CollectionLogType;
		flags: { [key: string]: string | number | undefined };
		stats: MUserStats | null;
		collectionLog?: IToReturnCollection;
		minigameScoresOverride?: Awaited<ReturnType<MUser['fetchMinigameScores']>> | null;
	}): Promise<CommandResponse> {
		const { sprite } = bankImageTask.getBgAndSprite({
			bankBackgroundId: options.user.user.bankBackground,
			farmingContract: options.user.farmingContract()
		});

		if (options.flags.temp) {
			options.type = 'temp';
		}
		const { collection, type, user, flags } = options;

		let collectionLog: IToReturnCollection | undefined | false;

		if (options.collectionLog) {
			collectionLog = options.collectionLog;
		}

		if (collection) {
			collectionLog = await getCollection({
				user,
				search: collection,
				flags,
				logType: type,
				minigameScoresOverride: options.minigameScoresOverride
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
									const _i = Items.getOrThrow(i);
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

		const canvas = new OSRSCanvas({
			width: canvasWidth,
			height: canvasHeight,
			sprite,
			iconPackId: user.iconPackId
		});
		const ctx = canvas.ctx;

		// 69 = top border height + bottom border height + title space + tab space
		const boxHeight = canvas.height - 69;

		canvas.drawBackgroundPattern();
		canvas.drawBorder();

		if (!fullSize) {
			canvas.drawHollowSquare(10, 59, canvas.width - 20, boxHeight, sprite.oddListColor);
			canvas.drawHollowSquare(leftDivisor, 59, rightArea, 47, sprite.oddListColor);
			canvas.drawHollowSquare(leftDivisor, 59, rightArea, boxHeight, sprite.oddListColor);
		} else {
			canvas.drawHollowSquare(10, 59, canvas.width - 20, boxHeight, sprite.oddListColor);
			canvas.drawHollowSquare(10, 59, canvas.width - 20, 47, sprite.oddListColor);
		}

		// Draw Title
		const title = `${user.rawUsername}'s ${toTitleCase(type)} Log - ${userTotalCl[1].toLocaleString()}/${userTotalCl[0].toLocaleString()} / ${calcWhatPercent(
			userTotalCl[1],
			userTotalCl[0]
		).toFixed(2)}%`;

		const titleX = Math.floor(canvas.width / 2 - canvas.measureTextWidth(title, 'Bold') / 2);
		canvas.drawText({
			text: title,
			x: titleX,
			y: 22,
			color: this.COLORS.ORANGEY,
			font: 'Bold'
		});

		// Draw cl tabs
		let aclIndex = 0;
		for (const cl of Object.keys(allCollectionLogs)) {
			const x = aclIndex * sprite.tabBorderInactive.width + aclIndex * 6 + 10;
			ctx.drawImage(cl === collectionLog.category ? sprite.tabBorderActive : sprite.tabBorderInactive, x, 39);
			canvas.drawText({
				text: cl,
				x: Math.floor(x + sprite.tabBorderInactive.width / 2 - canvas.measureTextWidth(cl) / 2),
				y: 39 + sprite.tabBorderInactive.height / 2 + 6,
				color: this.COLORS.TABS[cl === collectionLog.category ? 'SELECTED_TAB' : 'UNSELECTED_TAB']
			});
			aclIndex++;
		}

		// Draw items
		ctx.save();
		ctx.translate(!fullSize ? leftDivisor + 5 : 15, 110);
		let i = 0;
		let y = 0;

		for (const item of collectionLog.collection) {
			if (i > 0 && i % maxPerLine === 0) {
				i = 0;
				y += 1;
			}

			let qtyText = 0;
			if (!userCollectionBank.has(item)) {
				ctx.globalAlpha = 0.3;
			} else {
				qtyText = userCollectionBank.amount(item);
			}

			totalPrice += (Items.getOrThrow(item).price ?? 0) * qtyText;

			await canvas.drawItemIDSprite({
				itemID: item,
				x: Math.floor(i * (itemSize + itemSpacer)) + 1,
				y: Math.floor(y * (itemSize + itemSpacer)) + 1,
				quantity: qtyText > 0 ? qtyText : undefined
			});

			ctx.globalAlpha = 1;
			i++;
		}
		ctx.restore();

		ctx.save();
		ctx.translate(!fullSize ? leftDivisor + 5 : 15, 75);

		// Collection title
		let effectiveName = collectionLog.name;
		if (!collectionLog.counts) {
			effectiveName = `${effectiveName} (Uncounted CL)`;
		}
		canvas.drawText({
			text: effectiveName,
			x: 0,
			y: 0,
			color: this.COLORS.ORANGEY,
			font: 'Bold'
		});

		// Collection obtained items
		const toDraw = flags.missing ? 'Missing: ' : type === 'sacrifice' ? 'Sacrificed: ' : 'Obtained: ';
		canvas.drawText({
			text: toDraw,
			x: 0,
			y: 13,
			color: this.COLORS.ORANGEY
		});

		let color = this.COLORS.PAGE_TITLE.NOT_STARTED;
		if (collectionLog.collectionTotal === collectionLog.collectionObtained) {
			color = this.COLORS.PAGE_TITLE.COMPLETED;
		} else if (collectionLog.collectionTotal !== collectionLog.collectionObtained) {
			color = this.COLORS.PAGE_TITLE.PARTIAL_COMPLETION;
		}

		const obtainableMeasure = canvas.measureText(toDraw, 'Compact');
		canvas.drawText({
			text: `${flags.missing ? '' : `${collectionLog.collectionObtained.toLocaleString()}/`}${collectionLog.collectionTotal.toLocaleString()}`,
			x: Math.floor(obtainableMeasure.width),
			y: 13,
			color
		});

		if (collectionLog.completions && ['collection', 'bank'].includes(type)) {
			const baseText = collectionLog.isActivity ? 'Completions: ' : 'Kills: ';
			let drawnSoFar = baseText;
			// Times done/killed
			canvas.drawText({
				text: baseText,
				x: 0,
				y: 25,
				color: this.COLORS.ORANGEY
			});
			let pixelLevel = 25;
			for (const [type, value] of objectEntries(collectionLog.completions)) {
				const xxxx = canvas.measureTextWidth(`${drawnSoFar} / ${type}: ${value.toLocaleString()}`);
				if (xxxx >= 255) {
					pixelLevel += 10;
					drawnSoFar = '';
				}
				if (type !== 'Default') {
					canvas.drawText({
						text: ` / ${type}: `,
						x: canvas.measureTextWidth(drawnSoFar),
						y: pixelLevel,
						color: this.COLORS.ORANGEY
					});
					drawnSoFar += ` / ${type}: `;
				}

				const valueStr = value.toLocaleString();
				canvas.drawText({
					text: valueStr,
					x: canvas.measureTextWidth(drawnSoFar),
					y: pixelLevel,
					color: this.COLORS.WHITE
				});
				drawnSoFar += valueStr;
			}
			// TODO: Make looting count generic in future
			if (collectionLog.name === 'Guardians of the Rift') {
				canvas.drawText({
					text: ' Rifts searches: ',
					x: canvas.measureTextWidth(drawnSoFar),
					y: pixelLevel,
					color: this.COLORS.ORANGEY
				});
				drawnSoFar += ' Rifts searches: ';

				canvas.drawText({
					text: options.stats?.gotrRiftSearches.toLocaleString() ?? '',
					x: canvas.measureTextWidth(drawnSoFar),
					y: pixelLevel,
					color: this.COLORS.WHITE
				});
			}
		}

		ctx.restore();

		ctx.save();
		const value = toKMB(totalPrice);
		canvas.drawText({
			text: value,
			x: canvas.width - 15 - canvas.measureTextWidth(value),
			y: 75 + 25,
			color: generateHexColorForCashStack(totalPrice)
		});
		ctx.restore();

		if (leftListCanvas && !fullSize) {
			const rawLeftListCanvas = leftListCanvas.getCanvas();
			if (!flags.tall) {
				let selectedPos = 8;
				const listItemSize = 15;
				for (const name of Object.keys(collectionLog.leftList!)) {
					if (name === collectionLog.name) break;
					selectedPos += listItemSize;
				}
				// Canvas height - top area until list starts - left area, where list should end
				const listHeightSpace = canvas.height - 62 - 13;

				// Check if in the start of the list
				if (selectedPos <= listHeightSpace || selectedPos > leftListCanvas.height) {
					ctx.drawImage(
						rawLeftListCanvas,
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
					rawLeftListCanvas.height - listHeightSpace <=
					selectedPos
				) {
					ctx.drawImage(
						rawLeftListCanvas,
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
						rawLeftListCanvas,
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
				ctx.drawImage(rawLeftListCanvas, 12, 62);
			}
		}

		return {
			files: [{ attachment: await canvas.toScaledOutput(2), name: `${type}_log_${Date.now()}.png` }]
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
