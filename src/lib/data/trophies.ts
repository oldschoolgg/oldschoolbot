import '../customItems/customItems';

import { modifyItem } from '@oldschoolgg/toolkit';

import resolveItems from '../util/resolveItems';
import { setItemAlias } from './itemAliases';

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
