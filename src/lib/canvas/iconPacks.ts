import { StoreBitfield } from '@oldschoolgg/toolkit';

import type { CanvasImage } from '@/lib/canvas/canvasUtil.js';

export enum IconPackID {
	Halloween = 'halloween'
}

export const ItemIconPacks = {
	[IconPackID.Halloween]: {
		name: 'Halloween',
		storeBitfield: StoreBitfield.HalloweenItemIconPack,
		id: 'halloween',
		icons: new Map<number, CanvasImage>()
	}
};
