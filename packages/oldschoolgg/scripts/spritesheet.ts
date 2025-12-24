import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { type GenerateResult, SpriteSheetGenerator } from '@oldschoolgg/spritesheet';
import { Stopwatch } from '@oldschoolgg/toolkit';
import sharp from 'sharp';

const SPRITESHEETS_DIR = './';
const stopwatch = new Stopwatch();

const createSpriteSheet = async (files: string[], outputPath: string) => {
	const result = await SpriteSheetGenerator.generate({ images: files });

	const compressedBuff = await sharp(result.imageBuffer)
		.png({
			compressionLevel: 9
		})
		.toBuffer();
	await fs.writeFile(outputPath, compressedBuff);
	return result;
};
const getPngFiles = async (dir: string): Promise<string[]> => {
	const files = await fs.readdir(dir);
	return files.filter(file => path.extname(file).toLowerCase() === '.png').map(file => path.join(dir, file));
};
const generateJsonData = (result: GenerateResult) => {
	stopwatch.check('Generating spritesheet json');
	const jsonData: Record<string, [number, number, number, number]> = {};
	for (const [id, data] of Object.entries(result.positions)) {
		jsonData[id] = [data.x, data.y, data.width, data.height];
	}
	return jsonData;
};

async function generateGenericSpritesheet(inputDir: string, outputName: string) {
	const outputImagePath = path.join(SPRITESHEETS_DIR, `${outputName}.png`);
	const outputJsonPath = path.join(SPRITESHEETS_DIR, `${outputName}.json`);

	try {
		stopwatch.check(`Generating generic spritesheet from ${inputDir}`);

		const pngFiles = await getPngFiles(inputDir);
		stopwatch.check(`Found ${pngFiles.length} PNG files in ${inputDir}`);

		if (pngFiles.length === 0) {
			throw new Error('No PNG files found in the directory');
		}

		stopwatch.check(`Creating spritesheet with ${pngFiles.length} images`);
		const result = await createSpriteSheet(pngFiles, outputImagePath);

		const jsonData = generateJsonData(result);
		await fs.writeFile(outputJsonPath, JSON.stringify(jsonData, null, 2));

		stopwatch.check(`Generic spritesheet '${outputName}' created successfully`);
		return {
			imagePath: outputImagePath,
			jsonPath: outputJsonPath
		};
	} catch (error) {
		throw new Error(`Failed to generate generic spritesheet: ${error}`);
	}
}

async function main() {
	await generateGenericSpritesheet('./scripts/bank-image/', './src/assets/spritesheets/bank');

	stopwatch.check('Finished');
	process.exit();
}

main();
