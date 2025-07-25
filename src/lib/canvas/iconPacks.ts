import { StoreBitfield } from '@oldschoolgg/toolkit/util';

import type { CanvasImage } from './canvasUtil';

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
