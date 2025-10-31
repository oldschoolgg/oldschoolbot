import '../src/lib/safeglobals.js';

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { type GenerateResult, SpriteSheetGenerator } from '@oldschoolgg/spritesheet';
import { isFunction, Stopwatch, uniqueArr } from '@oldschoolgg/toolkit';
import '../src/lib/safeglobals.js';

import { Bank, EItem, GearStat, Items, resolveItems } from 'oldschooljs';
import sharp from 'sharp';

import { ALL_OBTAINABLE_ITEMS } from '@/lib/allObtainableItems.js';
import { HolidayItems } from '@/lib/data/holidayItems.js';
import { findBestGearSetups } from '@/lib/gear/functions/findBestGearSetups.js';
import { BOT_TYPE } from '../src/lib/constants.js';
import Buyables from '../src/lib/data/buyables/buyables.js';
import { allCLItems } from '../src/lib/data/Collections.js';
import Createables from '@/lib/data/createables.js';

const SPRITESHEETS_DIR = './src/lib/resources/spritesheets';
const OSB_ICONS_DIR = './src/lib/resources/images/osb_icons';
const stopwatch = new Stopwatch();

const tradeableItems = Items.filter(i => Boolean(i.tradeable_on_ge)).map(i => i.id);
const itemsMustBeInSpritesheet: number[] = uniqueArr([
	...allCLItems,
	...tradeableItems,
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
	...Array.from(ALL_OBTAINABLE_ITEMS),
	...resolveItems([
		'Collection log (bronze)',
		'Collection log (iron)',
		'Collection log (steel)',
		'Collection log (black)',
		'Collection log (mithril)',
		'Collection log (adamant)',
		'Collection log (rune)',
		'Collection log (dragon)',
		'Collection log (gilded)',
		'Bronze staff of collection',
		'Iron staff of collection',
		'Steel staff of collection',
		'Black staff of collection',
		'Mithril staff of collection',
		'Adamant staff of collection',
		'Rune staff of collection',
		'Dragon staff of collection',
		'Gilded staff of collection',
		'Bone shard',
		'Lump of crystal',
		'Dwarven rock cake',
		'Jewellery',
		'Fishing trophy',
		'Crystal tangleroot',
		'Dragonfruit tangleroot',
		'Herb tangleroot',
		'White lily tangleroot',
		'Redwood tangleroot',
		'Termites',
		'Fancier boots',
		...HolidayItems.Halloween.halloweenItems,
		...HolidayItems.Halloween.halloweenOnlyForPermIrons
	]),
	EItem.TOOLKIT,
	EItem.BUNNY_EARS,
	EItem.CRUSHED_GEM,
	EItem.YOYO,
	EItem.EASTER_BASKET,
	EItem.RUBBER_CHICKEN,
	EItem.BOBBLE_HAT,
	EItem.JESTER_HAT,
	EItem.TRIJESTER_HAT,
	EItem.WOOLLY_HAT,
	EItem.EASTER_RING,
	EItem.WARRIOR_GUILD_TOKEN,
	EItem.PIRATE_HAT,
	EItem.PIECES_OF_EIGHT,
	EItem.FANCY_BOOTS,
	EItem.FIGHTING_BOOTS,
	EItem.CONSTRUCT_CAPE,
	EItem.SAILING_BOOK,
	EItem.SNOWBALL,
	EItem.REINDEER_HAT,
	EItem.WINTUMBER_TREE,
	EItem.CRACKERS,
	EItem.TARNS_DIARY,
	EItem.CHOCOLATE_KEBBIT,
	EItem.BLACK_PARTYHAT,
	EItem.RAINBOW_PARTYHAT,
	EItem.CHOCOLATE_STRAWBERRY,
	EItem.COW_MASK,
	EItem.SALVE_AMULETI,
	EItem.COW_TOP,
	EItem.COW_TROUSERS,
	EItem.COW_GLOVES,
	EItem.COW_SHOES,
	EItem.INVERTED_SANTA_HAT,
	EItem.VOLCANIC_SULPHUR,
	EItem.GNOME_CHILD_HAT,
	EItem.HELM_OF_RAEDWALD,
	EItem.BOLOGAS_BLESSING,
	EItem.HUNTING_KNIFE,
	EItem.SNOW_GLOBE,
	EItem.SACK_OF_PRESENTS,
	EItem.GIANT_PRESENT,
	EItem.ANCIENT_TABLET,
	EItem.BIRTHDAY_BALLOONS,
	EItem.EASTER_EGG_HELM,
	EItem.MASTER_SCROLL_BOOK,
	EItem.MERMAIDS_TEAR,
	EItem.BRITTLE_KEY,
	EItem.SNOW_IMP_COSTUME_HEAD,
	EItem.SNOW_IMP_COSTUME_BODY,
	EItem.SNOW_IMP_COSTUME_LEGS,
	EItem.SNOW_IMP_COSTUME_TAIL,
	EItem.SNOW_IMP_COSTUME_GLOVES,
	EItem.SNOW_IMP_COSTUME_FEET,
	EItem.BULGING_SACK,
	EItem.PROP_SWORD,
	EItem.EGGSHELL_PLATEBODY,
	EItem.EGGSHELL_PLATELEGS,
	EItem.STARFACE,
	EItem.TREE_TOP,
	EItem.TREE_SKIRT,
	EItem.CANDY_CANE,
	EItem.MOLCH_PEARL,
	EItem.GIANT_EASTER_EGG,
	EItem.BUNNYMAN_MASK,
	EItem.GREEN_GINGERBREAD_SHIELD,
	EItem.RED_GINGERBREAD_SHIELD,
	EItem.BLUE_GINGERBREAD_SHIELD,
	EItem.CAT_EARS,
	EItem.MAGIC_EGG_BALL,
	EItem.CARROT_SWORD,
	EItem.CARROT,
	EItem.AMULET_OF_BLOOD_FURY,
	EItem.MAGICAL_PUMPKIN,
	EItem.SLED,
	EItem.GIANT_BOULDER,
	EItem.CURSED_BANANA,
	EItem.BANANA_CAPE,
	EItem.STARDUST,
	EItem.CELESTIAL_RING,
	EItem.GREGGS_EASTDOOR,
	EItem.PROPELLER_HAT,
	EItem.PASTEL_FLOWERS,
	EItem.IMCANDO_HAMMER_BROKEN,
	EItem.RAW_GUPPY,
	EItem.RAW_CAVEFISH,
	EItem.RAW_TETRA,
	EItem.RAW_CATFISH,
	EItem.BARRONITE_DEPOSIT,
	EItem.ASH_SANCTIFIER,
	EItem.BANANA_HAT,
	EItem.GHOMMALS_HILT_1,
	EItem.GHOMMALS_HILT_2,
	EItem.GHOMMALS_HILT_3,
	EItem.GHOMMALS_HILT_4,
	EItem.PINK_STAINED_PLATEBODY,
	EItem.PINK_STAINED_PLATELEGS,
	EItem.PINK_STAINED_FULL_HELM,
	EItem.SECRET_SANTA_PRESENT,
	EItem.FESTIVE_ELF_SLIPPERS,
	EItem.FESTIVE_ELF_HAT,
	EItem.SNOWMAN_RING,
	EItem.ECUMENICAL_KEY_SHARD,
	EItem.EASTER_HAT,
	EItem.CRATE_RING,
	EItem.GHOMMALS_LUCKY_PENNY,
	EItem.SACK_OF_COAL,
	EItem.EGGNOG,
	EItem.SANTAS_LIST,
	EItem.CHRISTMAS_JUMPER,
	EItem.SNOW_GOGGLES_HAT,
	EItem.FESTIVE_NUTCRACKER_TOP,
	EItem.FESTIVE_NUTCRACKER_TROUSERS,
	EItem.FESTIVE_NUTCRACKER_HAT,
	EItem.FESTIVE_NUTCRACKER_BOOTS,
	EItem.FESTIVE_NUTCRACKER_STAFF,
	EItem.SWEET_NUTCRACKER_TOP,
	EItem.SWEET_NUTCRACKER_TROUSERS,
	EItem.SWEET_NUTCRACKER_HAT,
	EItem.SWEET_NUTCRACKER_BOOTS,
	EItem.SWEET_NUTCRACKER_STAFF,
	EItem.FESTIVE_GAMES_CROWN,
	EItem.VENATOR_BOW,
	EItem.ANIMAINFUSED_BARK,
	EItem.LEPRECHAUN_CHARM,
	EItem.CLOVER_INSIGNIA,
	EItem.BEE_ON_A_STICK,
	EItem.POWDERED_POLLEN,
	EItem.ANCIENT_BLOOD_ORNAMENT_KIT,
	EItem.PHEASANT_TAIL_FEATHERS,
	EItem.RAINBOW_CAPE,
	EItem.RAINBOW_CROWN_SHIRT,
	EItem.DARK_SQUALL_HOOD,
	EItem.DARK_SQUALL_ROBE_TOP,
	EItem.DARK_SQUALL_ROBE_BOTTOM,
	EItem.SILIF,
	EItem.LIT_EXPLOSIVE,
	EItem.SMOULDERING_HEART,
	EItem.SMOULDERING_PILE_OF_FLESH,
	EItem.SMOULDERING_GLAND,
	EItem.DEADMAN_RUG,
	EItem.CORRUPTED_DARK_BOW,
	EItem.CORRUPTED_VOLATILE_NIGHTMARE_STAFF,
	EItem.VOIDWAKER_DEADMAN,
	EItem.VOLATILE_NIGHTMARE_STAFF_DEADMAN,
	EItem.DARK_BOW_DEADMAN,
	EItem.BUTLERS_TRAY,
	EItem.COSTUME_NEEDLE,
	EItem.LOOP_HALF_OF_KEY_MOON_KEY,
	29648, // Sigil of meticulousness
	29651, // Sigil of revoked limitation
	29654, // Sigil of rampart
	29657, // Sigil of deception
	29660, // Sigil of lithe
	29663, // Sigil of adroit
	29666, // Sigil of onslaught
	29669, // Sigil of restoration
	29672, // Sigil of swashbuckler
	29675, // Sigil of gunslinger
	29678, // Sigil of arcane swiftness
	26304, // Chocolate chips
	24539, //'24CARAT_SWORD',
	26306, // Chocolate chips
	29509, // Colourful crown shirt
	29510, // Colourful crown shirt
	29511, // Colourful crown shirt
	29512, // Colourful crown shirt
	29513, // Colourful crown shirt
	29514, // Colourful crown shirt
	29515, // Colourful crown shirt
	29516, // Colourful crown shirt
	29491, // Colourful cape
	29493, // Colourful cape
	29495, // Colourful cape
	29497, // Colourful cape
	29499, // Colourful cape
	29501, // Colourful cape
	29503, // Colourful cape
	29505, // Colourful cape
	4133, // Crawling hand
	7774, // Reward token
	7775, // Reward token
	7776 // Reward token
]);

const bisGearItems = new Set<number>();

for (const stat of Object.values(GearStat)) {
	const gearSetups = findBestGearSetups({ stat, ignoreUnobtainable: true, limit: 10 });
	for (const setup of gearSetups) {
		for (const id of setup.allItems(false)) {
			const item = Items.get(id);
			if (!item) continue;
			if ([' (75)', ' (100)', ' (50)', ' (25)', ' (0)', ' (l)'].some(t => item.wiki_name?.includes(t))) continue;
			bisGearItems.add(item.id);
		}
	}
}

const bisGearMissing = Array.from(bisGearItems).filter(i => !itemsMustBeInSpritesheet.includes(i));

itemsMustBeInSpritesheet.push(...bisGearMissing);

const getPngFiles = async (dir: string): Promise<string[]> => {
	const files = await fs.readdir(dir);
	return files.filter(file => path.extname(file).toLowerCase() === '.png').map(file => path.join(dir, file));
};

const OSB_ITEMS_WITH_SPECIAL_ICON: number[] = (await fs.readdir(OSB_ICONS_DIR)).map(f =>
	Number.parseInt(f.replace('.png', ''))
);
itemsMustBeInSpritesheet.push(...OSB_ITEMS_WITH_SPECIAL_ICON);

// Copy all icons in osb_icons to tmp/icons
await fs.mkdir('./tmp/icons', { recursive: true });
for (const file of OSB_ITEMS_WITH_SPECIAL_ICON) {
	await fs.copyFile(path.join(OSB_ICONS_DIR, `${file}.png`), path.join('./tmp/icons', `${file}.png`));
}

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

const generateJsonData = (result: GenerateResult) => {
	stopwatch.check('Generating spritesheet json');
	const jsonData: Record<string, [number, number, number, number]> = {};
	for (const [id, data] of Object.entries(result.positions)) {
		jsonData[id] = [data.x, data.y, data.width, data.height];
	}
	return jsonData;
};

async function makeSpritesheet(iconsDir: string, name: string, allItems?: number[]) {
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
		path.join(SPRITESHEETS_DIR, `${name}.png`)
	);
	const jsonData = generateJsonData(result);
	await fs.writeFile(path.join(SPRITESHEETS_DIR, `${name}.json`), JSON.stringify(jsonData, null, 2));
	stopwatch.check('Spritesheet and JSON created successfully');
}

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
	if (BOT_TYPE !== 'OSB') throw new Error('This script is only for OSB.');
	stopwatch.check('Making OSB spritesheet');
	await makeSpritesheet('./tmp/icons', 'items-spritesheet', itemsMustBeInSpritesheet).catch(err =>
		console.error(`Failed to make OSB spritesheet: ${err.message}`)
	);

	stopwatch.check('Making BSO spritesheet');
	await makeSpritesheet('./src/lib/resources/images/bso_icons', 'bso-items-spritesheet').catch(err =>
		console.error(`Failed to make BSO spritesheet: ${err.message}`)
	);

	await generateGenericSpritesheet('./src/lib/resources/images/grandexchange/', 'ge-spritesheet');

	stopwatch.check('Finished');
	process.exit();
}

main();
