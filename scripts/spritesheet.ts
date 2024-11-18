import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import Spritesmith from 'spritesmith';
import '../src/lib/safeglobals';

import { isFunction, uniqueArr } from 'e';
import { Bank, Items } from 'oldschooljs';
import { ALL_OBTAINABLE_ITEMS } from '../src/lib/allObtainableItems';
import { BOT_TYPE } from '../src/lib/constants';
import { allCLItems } from '../src/lib/data/Collections';
import Buyables from '../src/lib/data/buyables/buyables';
import Createables from '../src/lib/data/createables';

const stopwatch = new Stopwatch();

const manualIDs = [
	11139, 25500, 21724, 26280, 24301, 19687, 22695, 24327, 3469, 13283, 12895, 21845, 22715, 21842, 7775, 25920, 26310,
	27576, 21046, 11862, 27574, 25633, 26256, 27584, 21841, 25054, 3462, 25048, 7774, 25044, 21846, 19697, 3451, 12892,
	13182, 13344, 6859, 20836, 20834, 9006, 24382, 11771, 27585, 27563, 22351, 28590, 13663, 26939, 22692, 19710, 1526,
	13286, 8851, 24539, 24303, 6860, 27475, 3466, 20775, 9925, 11185, 26258, 26260, 9756, 12926, 10507, 27497, 25932,
	22684, 25502, 25426, 13396, 3467, 25924, 25670, 21209, 11910, 25923, 24300, 21656, 13343, 22353, 27275, 10587,
	25430, 22713, 9789, 12793, 27583, 21389, 25424, 27588, 9921, 11019, 21719, 22820, 25930, 22698, 4565, 12956, 28190,
	11020, 26312, 13285, 12893, 22717, 28179, 9922, 3452, 28588, 24546, 25342, 12888, 27572, 9920, 22316, 13202, 28589,
	27479, 25652, 3459, 25925, 12959, 10513, 3465, 13664, 26284, 20777, 11919, 3460, 24376, 28587, 3461, 13665, 13287,
	9904, 24537, 28181, 27564, 12794, 12017, 22701, 28624, 27582, 6862, 25046, 12957, 22993, 10501, 26254, 13513, 4566,
	26282, 26314, 27578, 13655, 21874, 11141, 23448, 24428, 24380, 24372, 11137, 20779, 26388, 25604, 28336, 23446,
	27586, 25428, 24780, 25658, 12891, 27544, 12792, 3463, 6856, 25781, 3453, 13288, 26306, 11918, 3468, 11022, 4079,
	11773, 8951, 11770, 13284, 7776, 9924, 11021, 3455, 3464, 1633, 6863, 24325, 19689, 12931, 24975, 26937, 12890,
	22689, 12691, 4133, 12692, 26304, 9005, 25042, 26298, 27558, 27568, 25527, 27693, 12889, 1419, 27566, 25921, 24302,
	21844, 11772, 12887, 25606, 24304, 24374, 19691, 11863, 25840, 28134, 3450, 27580, 3458, 24384, 12896, 25541, 24977,
	22719, 3454, 6722, 20773, 25432, 27477, 25314, 1037, 6858, 25684, 25926, 8950, 25052, 12894, 28409, 10508, 23083,
	6861, 25664, 27481, 25282, 7927, 13571, 24378, 1, 24430, 25609, 19695, 11847, 20747, 21752, 24431, 20832, 27610,
	21214, 25922, 27473, 9923, 28184, 24535, 3456, 25928, 24525, 21843, 12845, 11026, 3457, 25050, 19693, 6857, 12958,
	29489, 29491, 29493, 29495, 29497, 29499, 29501, 29503, 29505, 29507, 29509, 29510, 29511, 29512, 29513, 29514,
	29515, 29516, 29560, 29562, 29564, 29566, 29568, 29570, 29572, 29573, 29574, 29577, 29580, 29583, 29585, 29587,
	29589, 29591, 29594, 29596, 29598, 29599, 29602, 29605, 29607, 29609, 29611, 29613, 29615, 29617, 29619, 29622,
	29625, 29628, 29631, 29634, 29637, 29640, 29643, 29648, 29649, 29651, 29652, 29654, 29655, 29657, 29658, 29660,
	29661, 29663, 29664, 29666, 29667, 29669, 29670, 29672, 29673, 29675, 29676, 29678, 29679, 29684, 29920, 29912
];
const trades = Items.filter(i => Boolean(i.tradeable_on_ge)).map(i => i.id);
const itemsMustBeInSpritesheet: number[] = uniqueArr([
	...allCLItems,
	...trades,
	...Createables.map(c => new Bank(c.outputItems).items().flatMap(i => i[0].id)).flat(2),
	...Buyables.flatMap(b => {
		if (!b.outputItems) return [];
		if (isFunction(b.outputItems)) {
			return b
				.outputItems({ countSkillsAtLeast99: () => 100 } as any)
				.items()
				.flatMap(i => i[0].id);
		}
		return b.outputItems.items().flatMap(i => i[0].id);
	}),
	...manualIDs,
	...Array.from(ALL_OBTAINABLE_ITEMS)
]);

const getPngFiles = async (dir: string): Promise<string[]> => {
	const files = await fs.readdir(dir);
	return files.filter(file => path.extname(file).toLowerCase() === '.png').map(file => path.join(dir, file));
};

const createSpriteSheet = (files: string[], outputPath: string): Promise<Spritesmith.Result> => {
	return new Promise((resolve, reject) => {
		Spritesmith.run({ src: files }, async (err, result) => {
			if (err) return reject(err);
			try {
				await fs.writeFile(outputPath, result.image);
				resolve(result);
			} catch (writeError) {
				reject(writeError);
			}
		});
	});
};

const generateJsonData = (result: Spritesmith.Result): Record<string, any> => {
	stopwatch.check('Generating spritesheet.json');
	const jsonData: Record<string, any> = {};
	for (const [filePath, data] of Object.entries(result.coordinates) as any[]) {
		const fileName = path.basename(filePath, '.png');
		jsonData[fileName] = [data.x, data.y, data.width, data.height];
	}
	return jsonData;
};

async function makeSpritesheet(
	iconsDir: string,
	outputImageFilePath: string,
	outputJsonFilePath: string,
	allItems?: number[]
) {
	const pngFiles = await getPngFiles(iconsDir);
	stopwatch.check(`Found ${pngFiles.length} PNG files in ${iconsDir}`);
	if (pngFiles.length === 0) {
		throw new Error('No PNG files found in the directory');
	}

	const filesToDo: string[] = [];
	if (!allItems) allItems = pngFiles.map(file => Number.parseInt(path.basename(file, '.png')));
	for (const id of allItems) {
		if (!pngFiles.some(file => file.endsWith(`${id}.png`))) {
			stopwatch.check(`Item ${id} not found in spritesheet, adding...`);
		} else {
			filesToDo.push(`${id}.png`);
		}
	}

	stopwatch.check(`Rendering spritesheet image with ${filesToDo.length} items`);
	const result = await createSpriteSheet(
		filesToDo.map(p => path.join(iconsDir, p)),
		outputImageFilePath
	);
	const jsonData = generateJsonData(result);
	await fs.writeFile(outputJsonFilePath, JSON.stringify(jsonData, null, 2));
	stopwatch.check('Spritesheet and JSON created successfully');
}

async function main() {
	if (BOT_TYPE !== 'OSB') throw new Error('This script is only for OSB.');
	stopwatch.check('Making OSB spritesheet');
	await makeSpritesheet(
		'./tmp/icons',
		'./src/lib/resources/images/spritesheet.png',
		'./src/lib/resources/images/spritesheet.json',
		itemsMustBeInSpritesheet
	).catch(err => console.error(`Failed to make OSB spritesheet: ${err.message}`));

	stopwatch.check('Making BSO spritesheet');
	await makeSpritesheet(
		'./src/lib/resources/images/bso_icons',
		'./src/lib/resources/images/bso_spritesheet.png',
		'./src/lib/resources/images/bso_spritesheet.json'
	).catch(err => console.error(`Failed to make BSO spritesheet: ${err.message}`));

	stopwatch.check('Finished');
	process.exit();
}

main();
