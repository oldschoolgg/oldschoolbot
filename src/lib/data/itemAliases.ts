import { deepMerge, modifyItem } from '@oldschoolgg/toolkit';
import { omit } from 'lodash';
import { EItem, Items } from 'oldschooljs';
import { allTeamCapes } from 'oldschooljs/dist/data/itemConstants';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';
import { cleanString } from 'oldschooljs/dist/util/cleanString';
import { getItemOrThrow, resolveItems } from 'oldschooljs/dist/util/util';

import { customItems } from '../customItems/util';

export function setItemAlias(id: number, name: string | string[], rename = true) {
	if (customItems.length === 0) {
		throw new Error('Custom items have not been loaded yet.');
	}
	const existingItem = Items.get(id);
	if (!existingItem) {
		throw new Error(`Tried to add item alias for a non-existant item: ${name} ${id}`);
	}
	let firstName: string | null = null;
	// Add the item to the custom items array
	if (typeof name === 'string') {
		firstName = name;
		itemNameMap.set(name, id);
		itemNameMap.set(cleanString(name), id);
	} else {
		for (const _name of name) {
			if (!firstName) firstName = _name;
			itemNameMap.set(_name, id);
			itemNameMap.set(cleanString(_name), id);
		}
	}
	// Update the item name to it's first alias
	if (rename) {
		Items.set(id, {
			...Items.get(id)!,
			name: firstName!,
			id
		});
	}
}

// Graceful sets -- Arceuus
setItemAlias(13_579, ['Arceuus graceful hood', 'Purple graceful hood']);
setItemAlias(13_581, ['Arceuus graceful cape', 'Purple graceful cape']);
setItemAlias(13_583, ['Arceuus graceful top', 'Purple graceful top']);
setItemAlias(13_585, ['Arceuus graceful legs', 'Purple graceful legs']);
setItemAlias(13_587, ['Arceuus graceful gloves', 'Purple graceful gloves']);
setItemAlias(13_589, ['Arceuus graceful boots', 'Purple graceful boots']);
// Graceful sets -- Port Piscarilius
setItemAlias(13_591, ['Piscarilius graceful hood', 'Cyan graceful hood']);
setItemAlias(13_593, ['Piscarilius graceful cape', 'Cyan graceful cape']);
setItemAlias(13_595, ['Piscarilius graceful top', 'Cyan graceful top']);
setItemAlias(13_597, ['Piscarilius graceful legs', 'Cyan graceful legs']);
setItemAlias(13_599, ['Piscarilius graceful gloves', 'Cyan graceful gloves']);
setItemAlias(13_601, ['Piscarilius graceful boots', 'Cyan graceful boots']);
// Graceful sets -- Lovakengj
setItemAlias(13_603, ['Lovakengj graceful hood', 'Yellow graceful hood']);
setItemAlias(13_605, ['Lovakengj graceful cape', 'Yellow graceful cape']);
setItemAlias(13_607, ['Lovakengj graceful top', 'Yellow graceful top']);
setItemAlias(13_609, ['Lovakengj graceful legs', 'Yellow graceful legs']);
setItemAlias(13_611, ['Lovakengj graceful gloves', 'Yellow graceful gloves']);
setItemAlias(13_613, ['Lovakengj graceful boots', 'Yellow graceful boots']);
// Graceful sets -- Shayzien
setItemAlias(13_615, ['Shayzien graceful hood', 'Red graceful hood']);
setItemAlias(13_617, ['Shayzien graceful cape', 'Red graceful cape']);
setItemAlias(13_619, ['Shayzien graceful top', 'Red graceful top']);
setItemAlias(13_621, ['Shayzien graceful legs', 'Red graceful legs']);
setItemAlias(13_623, ['Shayzien graceful gloves', 'Red graceful gloves']);
setItemAlias(13_625, ['Shayzien graceful boots', 'Red graceful boots']);
// Graceful sets -- Hosidius
setItemAlias(13_627, ['Hosidius graceful hood', 'Green graceful hood']);
setItemAlias(13_629, ['Hosidius graceful cape', 'Green graceful cape']);
setItemAlias(13_631, ['Hosidius graceful top', 'Green graceful top']);
setItemAlias(13_633, ['Hosidius graceful legs', 'Green graceful legs']);
setItemAlias(13_635, ['Hosidius graceful gloves', 'Green graceful gloves']);
setItemAlias(13_637, ['Hosidius graceful boots', 'Green graceful boots']);
// Graceful sets -- All cities
setItemAlias(13_667, ['Kourend graceful hood', 'White graceful hood']);
setItemAlias(13_669, ['Kourend graceful cape', 'White graceful cape']);
setItemAlias(13_671, ['Kourend graceful top', 'White graceful top']);
setItemAlias(13_673, ['Kourend graceful legs', 'White graceful legs']);
setItemAlias(13_675, ['Kourend graceful gloves', 'White graceful gloves']);
setItemAlias(13_677, ['Kourend graceful boots', 'White graceful boots']);
// Graceful sets -- Brimhaven
setItemAlias(21_061, ['Brimhaven graceful hood', 'Dark blue graceful hood']);
setItemAlias(21_064, ['Brimhaven graceful cape', 'Dark blue graceful cape']);
setItemAlias(21_067, ['Brimhaven graceful top', 'Dark blue graceful top']);
setItemAlias(21_070, ['Brimhaven graceful legs', 'Dark blue graceful legs']);
setItemAlias(21_073, ['Brimhaven graceful gloves', 'Dark blue graceful gloves']);
setItemAlias(21_076, ['Brimhaven graceful boots', 'Dark blue graceful boots']);
// Graceful sets -- Brimhaven
setItemAlias(24_743, ['Dark graceful hood', 'Black graceful hood']);
setItemAlias(24_746, ['Dark graceful cape', 'Black graceful cape']);
setItemAlias(24_749, ['Dark graceful top', 'Black graceful top']);
setItemAlias(24_752, ['Dark graceful legs', 'Black graceful legs']);
setItemAlias(24_755, ['Dark graceful gloves', 'Black graceful gloves']);
setItemAlias(24_758, ['Dark graceful boots', 'Black graceful boots']);
// Graceful sets -- Trailblazer
setItemAlias(25_069, 'Trailblazer graceful hood');
setItemAlias(25_072, 'Trailblazer graceful cape');
setItemAlias(25_075, 'Trailblazer graceful top');
setItemAlias(25_078, 'Trailblazer graceful legs');
setItemAlias(25_081, 'Trailblazer graceful gloves');
setItemAlias(25_084, 'Trailblazer graceful boots');

// Supply crate (Mahogany Homes)
setItemAlias(24_884, 'Builders supply crate');

setItemAlias(25_344, 'Red soul cape');
setItemAlias(25_346, 'Blue soul cape');

setItemAlias(6672, 'Fishbowl pet');

setItemAlias(3062, ['pmb'], false);
setItemAlias(3713, ['hmb'], false);
setItemAlias(6199, ['tmb'], false);
setItemAlias(19_939, ['umb'], false);
setItemAlias(47_509, ['emb'], false);
setItemAlias(19_837, ['gmc'], false);
setItemAlias(19_838, ['gm'], false);
setItemAlias(50_421, ['cmb'], false);
setItemAlias(40_058, ['ccu'], false);
setItemAlias(40_059, ['cct'], false);
setItemAlias(13_345, ['tgb'], false);

// Castle wars
setItemAlias(25_165, 'Red decorative full helm');
setItemAlias(4071, 'Red decorative helm');
setItemAlias(4069, 'Red decorative body');
setItemAlias(4070, 'Red decorative legs');
setItemAlias(11_893, 'Red decorative skirt');
setItemAlias(25_163, 'Red decorative boots');
setItemAlias(4072, 'Red decorative shield');
setItemAlias(4068, 'Red decorative sword');

setItemAlias(25_169, 'White decorative full helm');
setItemAlias(4506, 'White decorative helm');
setItemAlias(4504, 'White decorative body');
setItemAlias(4505, 'White decorative legs');
setItemAlias(11_894, 'White decorative skirt');
setItemAlias(25_167, 'White decorative boots');
setItemAlias(4507, 'White decorative shield');
setItemAlias(4503, 'White decorative sword');

setItemAlias(25_174, 'Gold decorative full helm');
setItemAlias(4511, 'Gold decorative helm');
setItemAlias(4509, 'Gold decorative body');
setItemAlias(4510, 'Gold decorative legs');
setItemAlias(11_895, 'Gold decorative skirt');
setItemAlias(25_171, 'Gold decorative boots');
setItemAlias(4512, 'Gold decorative shield');
setItemAlias(4508, 'Gold decorative sword');

setItemAlias(4515, 'Zamorak castlewars hood');
setItemAlias(4516, 'Zamorak castlewars cloak');
setItemAlias(4513, 'Saradomin castlewars hood');
setItemAlias(4514, 'Saradomin castlewars cloak');

setItemAlias(11_898, 'Decorative magic hat');
setItemAlias(11_896, 'Decorative magic top');
setItemAlias(11_897, 'Decorative magic robe');
setItemAlias(11_899, 'Decorative ranged top');
setItemAlias(11_900, 'Decorative ranged legs');
setItemAlias(11_901, 'Decorative quiver');

// Lamp (Genie event)
setItemAlias(2528, 'Genie lamp');

// Ore Sack
setItemAlias(27_019, "Ore pack (Giant's Foundry)");
setItemAlias(27_693, 'Ore pack (Volcanic Mine)');

// Birds eggs
setItemAlias(5076, 'Red bird egg');
setItemAlias(5077, 'Blue bird egg');
setItemAlias(5078, 'Green bird egg');

// Chompy hats
setItemAlias(2978, 'Chompy bird hat (ogre bowman)');
setItemAlias(2979, 'Chompy bird hat (bowman)');
setItemAlias(2980, 'Chompy bird hat (ogre yeoman)');
setItemAlias(2981, 'Chompy bird hat (yeoman)');
setItemAlias(2982, 'Chompy bird hat (ogre marksman)');
setItemAlias(2983, 'Chompy bird hat (marksman)');
setItemAlias(2984, 'Chompy bird hat (ogre woodsman)');
setItemAlias(2985, 'Chompy bird hat (woodsman)');
setItemAlias(2986, 'Chompy bird hat (ogre forester)');
setItemAlias(2987, 'Chompy bird hat (forester)');
setItemAlias(2988, 'Chompy bird hat (ogre bowmaster)');
setItemAlias(2989, 'Chompy bird hat (bowmaster)');
setItemAlias(2990, 'Chompy bird hat (ogre expert)');
setItemAlias(2991, 'Chompy bird hat (expert)');
setItemAlias(2992, 'Chompy bird hat (ogre dragon archer)');
setItemAlias(2993, 'Chompy bird hat (dragon archer)');
setItemAlias(2994, 'Chompy bird hat (expert ogre dragon archer)');
setItemAlias(2995, 'Chompy bird hat (expert dragon archer)');

// Item aliases
setItemAlias(11_137, 'Antique lamp 1');
setItemAlias(11_139, 'Antique lamp 2');
setItemAlias(11_141, 'Antique lamp 3');
setItemAlias(11_185, 'Antique lamp 4');

// Dragonfire shields
setItemAlias(11_284, 'Uncharged dragonfire shield');
setItemAlias(11_283, 'Dragonfire shield');

setItemAlias(21_634, 'Uncharged ancient wyvern shield');
setItemAlias(21_633, 'Ancient wyvern shield');

setItemAlias(22_003, 'Uncharged dragonfire ward');
setItemAlias(22_002, 'Dragonfire ward');

// LMS Items
setItemAlias(23_611, 'Armadyl crossbow (LMS)');
setItemAlias(20_593, 'Armadyl godsword (LMS)');
setItemAlias(20_408, 'Dark bow (LMS)');
setItemAlias(20_389, 'Dragon arrow (LMS)');
setItemAlias(20_784, 'Dragon claws (LMS)');
setItemAlias(23_628, 'Ghrazi rapier (LMS)');
setItemAlias(20_557, 'Granite maul (LMS)');
setItemAlias(23_630, 'Heavy ballista (LMS)');
setItemAlias(23_648, 'Dragon javelin (LMS)');
setItemAlias(23_622, 'Infernal cape (LMS)');
setItemAlias(23_652, "Mage's book (LMS)");
setItemAlias(23_654, 'Occult necklace (LMS)');
setItemAlias(23_626, 'Kodai wand (LMS)');
setItemAlias(23_624, 'Seers ring (i) (LMS)');
setItemAlias(23_613, 'Staff of the dead (LMS)');
setItemAlias(20_598, "Ahrim's robetop (LMS)");
setItemAlias(20_599, "Ahrim's robeskirt (LMS)");
setItemAlias(23_640, 'Amulet of fury (LMS)');
setItemAlias(25_518, 'Ancestral hat (LMS)');
setItemAlias(23_646, 'Bandos tassets (LMS)');
setItemAlias(23_642, 'Blessed spirit shield (LMS)');
setItemAlias(23_644, 'Eternal boots (LMS)');
setItemAlias(23_638, "Guthan's helm (LMS)");
setItemAlias(23_632, "Karil's leathertop (LMS)");
setItemAlias(23_637, "Torag's helm (LMS)");
setItemAlias(23_634, "Torag's platelegs (LMS)");
setItemAlias(23_636, "Verac's helm (LMS)");
setItemAlias(23_635, "Verac's plateskirt (LMS)");
setItemAlias(23_619, "Morrigan's javelin (LMS)");
setItemAlias(23_615, "Vesta's longsword (LMS)");
setItemAlias(23_620, "Statius's warhammer (LMS)");
setItemAlias(25_517, 'Volatile nightmare staff (LMS)');
setItemAlias(23_617, "Zuriel's staff (LMS)");
setItemAlias(23_639, "Dharok's helm (LMS)");
setItemAlias(25_515, "Dharok's platebody (LMS)");
setItemAlias(23_633, "Dharok's platelegs (LMS)");
setItemAlias(25_516, "Dharok's greataxe (LMS)");
// Weird/broken/untradeable/scam/similarly named items
setItemAlias(19_559, 'Elysian spirit shield dust');
setItemAlias(2422, "Wise old man's partyhat");
// Metamorphs
setItemAlias(24_555, 'Crystal tangleroot');
setItemAlias(24_557, 'Dragonfruit tangleroot');
setItemAlias(24_559, 'Herb tangleroot');
setItemAlias(24_561, 'White lily tangleroot');
setItemAlias(24_563, 'Redwood tangleroot');
setItemAlias(13_324, 'Grey baby chinchompa');
setItemAlias(13_325, 'Black baby chinchompa');
setItemAlias(13_326, 'Gold baby chinchompa');
setItemAlias(24_483, 'Green phoenix');
setItemAlias(24_484, 'Blue phoenix');
setItemAlias(24_485, 'White phoenix');
setItemAlias(24_486, 'Purple phoenix');
setItemAlias(12_939, 'Magma pet snakeling');
setItemAlias(12_940, 'Tanzanite pet snakeling');
setItemAlias(25_842, 'Orange sraracha');
setItemAlias(25_843, 'Blue sraracha');
setItemAlias(12_654, 'Airborne kalphite princess');

// Kittens
setItemAlias(1555, 'Grey and black kitten');
setItemAlias(1556, 'White kitten');
setItemAlias(1557, 'Brown kitten');
setItemAlias(1558, 'Black kitten');
setItemAlias(1559, 'Grey and brown kitten');
setItemAlias(1560, 'Grey and blue kitten');

// Cats
setItemAlias(1561, 'Grey and black cat');
setItemAlias(1562, 'White cat');
setItemAlias(1563, 'Brown cat');
setItemAlias(1564, 'Black cat');
setItemAlias(1565, 'Grey and brown cat');
setItemAlias(1566, 'Grey and blue cat');

// Sepulchre pages
setItemAlias(24_763, 'Mysterious page 1');
setItemAlias(24_765, 'Mysterious page 2');
setItemAlias(24_767, 'Mysterious page 3');
setItemAlias(24_769, 'Mysterious page 4');
setItemAlias(24_771, 'Mysterious page 5');

// LMS ornaments
setItemAlias(24_225, 'Granite maul (ornate handle)');
setItemAlias(12_848, 'Granite maul (or)');
setItemAlias(24_227, 'Granite maul (or) (ornate handle)');
setItemAlias(12_797, 'Dragon pickaxe (upgraded)');
setItemAlias(12_806, 'Malediction ward (or)');
setItemAlias(12_807, 'Odium ward (or)');
setItemAlias(12_765, 'Dark bow (green)');
setItemAlias(12_766, 'Dark bow (blue)');
setItemAlias(12_767, 'Dark bow (yellow)');
setItemAlias(12_768, 'Dark bow (white)');
setItemAlias(12_796, 'Mystic steam staff (or)');
setItemAlias(12_795, 'Steam battlestaff (or)');
setItemAlias(21_200, 'Mystic lava staff (or)');
setItemAlias(21_198, 'Lava battlestaff (or)');

// Trouble Brewing
setItemAlias(8940, 'Red rum (trouble brewing)');
setItemAlias(8941, 'Blue rum (trouble brewing)');

setItemAlias(25_376, 'Dragon pickaxe (or) (Trailblazer)');

setItemAlias(3343, 'Bruise blue snelm (pointed)');
setItemAlias(3337, 'Myre snelm (pointed)');
setItemAlias(3339, "Blood'n'tar snelm (pointed)");
setItemAlias(3341, 'Ochre snelm (pointed)');

setItemAlias(7112, 'Pirate bandana (white)');
setItemAlias(7110, 'Stripy pirate shirt (white)');
setItemAlias(7116, 'Pirate leggings (white)');

setItemAlias(7130, 'Pirate bandana (blue)');
setItemAlias(7134, 'Stripy pirate shirt (blue)');
setItemAlias(7132, 'Pirate leggings (blue)');

setItemAlias(7136, 'Pirate bandana (brown)');
setItemAlias(7128, 'Stripy pirate shirt (brown)');
setItemAlias(7138, 'Pirate leggings (brown)');

setItemAlias(7124, 'Pirate bandana (red)');
setItemAlias(7122, 'Stripy pirate shirt (red)');
setItemAlias(7126, 'Pirate leggings (red)');

setItemAlias(6107, 'Ghostly robe top');
setItemAlias(6108, 'Ghostly robe bottom');

// JMOD Scythe:
setItemAlias(22_664, 'Scythe of vitur (JMod)');

// Flower crowns
setItemAlias(27_141, 'Flower crown (bisexual)');
setItemAlias(27_143, 'Flower crown (asexual)');
setItemAlias(27_145, 'Flower crown (transgender)');
setItemAlias(27_147, 'Flower crown (pansexual)');
setItemAlias(27_149, 'Flower crown (non-binary)');
setItemAlias(27_151, 'Flower crown (genderqueer)');
setItemAlias(27_153, 'Flower crown (lesbian)');
setItemAlias(27_155, 'Flower crown (gay)');

setItemAlias(23_330, 'Rune scimitar (guthix)');
setItemAlias(23_332, 'Rune scimitar (saradomin)');
setItemAlias(23_334, 'Rune scimitar (zamorak)');

setItemAlias(25_920, 'Antique lamp (easy ca)');
setItemAlias(25_921, 'Antique lamp (medium ca)');
setItemAlias(25_922, 'Antique lamp (hard ca)');
setItemAlias(25_923, 'Antique lamp (elite ca)');
setItemAlias(25_924, 'Antique lamp (master ca)');
setItemAlias(25_925, 'Antique lamp (grandmaster ca)');

/**
 * Trophies
 */

// BSO (Twisted) trophies
setItemAlias(24_372, 'BSO dragon trophy');
setItemAlias(24_374, 'BSO rune trophy');
setItemAlias(24_376, 'BSO adamant trophy');
setItemAlias(24_378, 'BSO mithril trophy');
setItemAlias(24_380, 'BSO steel trophy');
setItemAlias(24_382, 'BSO iron trophy');
setItemAlias(24_384, 'BSO bronze trophy');

// Comp. trophies
setItemAlias(25_042, 'Comp. dragon trophy');
setItemAlias(25_044, 'Comp. rune trophy');
setItemAlias(25_046, 'Comp. adamant trophy');
setItemAlias(25_048, 'Comp. mithril trophy');
setItemAlias(25_050, 'Comp. steel trophy');
setItemAlias(25_052, 'Comp. iron trophy');
setItemAlias(25_054, 'Comp. bronze trophy');

// Placeholder trophies
setItemAlias(26_515, 'Placeholder dragon trophy');
setItemAlias(26_513, 'Placeholder rune trophy');
setItemAlias(26_511, 'Placeholder adamant trophy');
setItemAlias(26_509, 'Placeholder mithril trophy');
setItemAlias(26_507, 'Placeholder steel trophy');
setItemAlias(26_505, 'Placeholder iron trophy');
setItemAlias(26_503, 'Placeholder bronze trophy');

export const allTrophyItems = resolveItems([
	'BSO dragon trophy',
	'BSO rune trophy',
	'BSO adamant trophy',
	'BSO mithril trophy',
	'BSO steel trophy',
	'BSO iron trophy',
	'BSO bronze trophy',
	'Comp. dragon trophy',
	'Comp. rune trophy',
	'Comp. adamant trophy',
	'Comp. mithril trophy',
	'Comp. steel trophy',
	'Comp. iron trophy',
	'Comp. bronze trophy',
	'Placeholder dragon trophy',
	'Placeholder rune trophy',
	'Placeholder adamant trophy',
	'Placeholder mithril trophy',
	'Placeholder steel trophy',
	'Placeholder iron trophy',
	'Placeholder bronze trophy'
]);

for (const item of allTrophyItems) {
	modifyItem(item, {
		tradeable: false,
		tradeable_on_ge: false,
		customItemData: {
			cantBeSacrificed: true,
			isSuperUntradeable: true,
			cantDropFromMysteryBoxes: true
		}
	});
}

/**
 * Item modifications
 */

export interface CustomItemData {
	cantBeSacrificed?: true;
	isSuperUntradeable?: boolean;
	cantDropFromMysteryBoxes?: boolean;
	cantBeDropped?: true;
	isDiscontinued?: true;
	superTradeableButTradeableOnGE?: true;
	isSecret?: true;
}

declare module 'oldschooljs/dist/meta/types' {
	interface Item {
		customItemData?: CustomItemData;
	}
}

for (const item of allTeamCapes) {
	modifyItem(item.id, {
		price: 100
	});
	if (getItemOrThrow(item.id).price !== 100) {
		throw new Error(`Failed to modify price of item ${item.id}`);
	}
}

export const itemDataSwitches = [
	{
		from: 25488,
		to: EItem.BELLATOR_RING
	},
	{
		from: 25486,
		to: EItem.MAGUS_RING
	},
	{
		from: 25487,
		to: EItem.VENATOR_RING
	},
	{
		from: 25485,
		to: EItem.ULTOR_RING
	}
];

for (const items of itemDataSwitches) {
	const from = getItemOrThrow(items.from);
	const to = getItemOrThrow(items.to);
	modifyItem(to.id, deepMerge(omit(to, 'id'), omit(from, 'id')));
}
