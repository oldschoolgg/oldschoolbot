import fs from 'node:fs/promises';
import path from 'node:path';
import glob from 'fast-glob';
import sharp from 'sharp';

import type { ImageGroup } from './types.js';

export class ImageLoader {
	static async loadFromPaths(imagePaths: string[]): Promise<ImageGroup> {
		const images: ImageGroup = {};

		for (const imagePath of imagePaths) {
			const buffer = await fs.readFile(imagePath);
			const { width, height } = await sharp(buffer).metadata();
			const id = path.basename(imagePath, path.extname(imagePath));

			images[id] = { id, buffer, width, height };
		}

		return images;
	}

	static async resolveImagePaths(input: string | string[]): Promise<string[]> {
		const patterns = Array.isArray(input) ? input : [input];
		const allPaths: string[] = [];

		for (const pattern of patterns) {
			if (pattern.includes('*')) {
				const matchedPaths = await glob(pattern);
				allPaths.push(...matchedPaths);
			} else {
				const stat = await fs.stat(pattern);
				if (stat.isDirectory()) {
					const files = await fs.readdir(pattern);
					const pngFiles = files
						.filter(file => path.extname(file).toLowerCase() === '.png')
						.map(file => path.join(pattern, file));
					allPaths.push(...pngFiles);
				} else {
					allPaths.push(pattern);
				}
			}
		}

		return [...new Set(allPaths)];
	}
}
