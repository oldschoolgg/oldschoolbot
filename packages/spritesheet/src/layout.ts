import type { ImageGroup, LayoutResult, SpritePosition } from './types.js';

type Bin = { x: number; y: number; width: number; height: number; used: boolean };

abstract class LayoutAlgorithm {
	abstract layout(images: ImageGroup): LayoutResult;
}

class BinPackLayout extends LayoutAlgorithm {
	constructor(
		private padding: number = 0,
		private powerOfTwo: boolean = false
	) {
		super();
	}

	layout(images: ImageGroup): LayoutResult {
		const sorted = [...Object.values(images)].sort(
			(a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height)
		);

		const bins: Bin[] = [];
		const positions: Record<string, SpritePosition> = {};
		let canvasWidth = 0;
		let canvasHeight = 0;

		for (const image of sorted) {
			const paddedWidth = image.width + this.padding * 2;
			const paddedHeight = image.height + this.padding * 2;

			let bestBin = this.findBestBin(bins, paddedWidth, paddedHeight);

			if (!bestBin) {
				if (canvasWidth === 0 && canvasHeight === 0) {
					canvasWidth = paddedWidth;
					canvasHeight = paddedHeight;
					bins.push({ x: 0, y: 0, width: canvasWidth, height: canvasHeight, used: false });
				} else if (canvasWidth <= canvasHeight) {
					const oldW = canvasWidth;
					canvasWidth += paddedWidth;
					// add a full right strip
					bins.push({ x: oldW, y: 0, width: canvasWidth - oldW, height: canvasHeight, used: false });
				} else {
					const oldH = canvasHeight;
					canvasHeight += paddedHeight;
					// add a full bottom strip
					bins.push({ x: 0, y: oldH, width: canvasWidth, height: canvasHeight - oldH, used: false });
				}
				bestBin = this.findBestBin(bins, paddedWidth, paddedHeight);
				if (!bestBin) {
					throw new Error('Placement failed: no fitting bin after growth');
				}
			}

			bestBin.used = true;
			positions[image.id] = {
				x: bestBin.x + this.padding,
				y: bestBin.y + this.padding,
				width: image.width,
				height: image.height
			};

			this.splitBin(bins, bestBin, paddedWidth, paddedHeight);
		}

		if (this.powerOfTwo) {
			canvasWidth = this.nextPowerOfTwo(canvasWidth);
			canvasHeight = this.nextPowerOfTwo(canvasHeight);
		}

		return { positions, width: canvasWidth, height: canvasHeight };
	}

	private findBestBin(bins: Bin[], width: number, height: number): Bin | null {
		let bestBin: Bin | null = null;
		let bestArea = Number.MAX_SAFE_INTEGER;
		for (const bin of bins) {
			if (!bin.used && bin.width >= width && bin.height >= height) {
				const area = bin.width * bin.height;
				if (area < bestArea) {
					bestArea = area;
					bestBin = bin;
				}
			}
		}
		return bestBin;
	}

	// Guillotine split: right strip (limited height), bottom strip (full width)
	private splitBin(bins: Bin[], bin: Bin, usedWidth: number, usedHeight: number): void {
		const rightWidth = bin.width - usedWidth;
		const bottomHeight = bin.height - usedHeight;

		if (rightWidth > 0) {
			bins.push({
				x: bin.x + usedWidth,
				y: bin.y,
				width: rightWidth,
				height: usedHeight,
				used: false
			});
		}

		if (bottomHeight > 0) {
			bins.push({
				x: bin.x,
				y: bin.y + usedHeight,
				width: bin.width,
				height: bottomHeight,
				used: false
			});
		}
	}

	private nextPowerOfTwo(n: number): number {
		return 1 << Math.ceil(Math.log2(Math.max(1, n)));
	}
}

export class LayoutFactory {
	static create(_type: string, options: { padding?: number; powerOfTwo?: boolean } = {}): LayoutAlgorithm {
		return new BinPackLayout(options.padding ?? 0, options.powerOfTwo ?? false);
	}
}
