import { PureImageCanvasProvider } from './canvas/pureimage';
import { LayoutFactory } from './layout';
import { ImageLoader } from './loader';
import type { GenerateOptions, GenerateResult } from './types.js';

export class SpriteSheetGenerator {
	static async generate(options: GenerateOptions): Promise<GenerateResult> {
		const config = {
			layout: 'binpack',
			canvas: 'auto',
			format: 'png',
			quality: 100,
			padding: 0,
			powerOfTwo: false,
			...options
		};

		const imagePaths = await ImageLoader.resolveImagePaths(options.images);
		const images = await ImageLoader.loadFromPaths(imagePaths);

		if (Object.keys(images).length === 0) {
			throw new Error('No images found');
		}

		const layoutAlgorithm = LayoutFactory.create(config.layout, config);

		const layout = layoutAlgorithm.layout(images);

		const { imageBuffer } = await PureImageCanvasProvider.generateSpriteSheet({ layout, images });

		return {
			imageBuffer,
			...layout
		};
	}
}
