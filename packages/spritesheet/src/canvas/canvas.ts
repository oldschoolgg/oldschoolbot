import type { ImageGroup, LayoutResult } from '../types.js';

export type CanvasProvider = {
	generateSpriteSheet({
		layout,
		images
	}: { layout: LayoutResult; images: ImageGroup }): Promise<{ imageBuffer: Buffer }>;
};
