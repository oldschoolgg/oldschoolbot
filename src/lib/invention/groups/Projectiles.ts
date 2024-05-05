import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Projectiles: DisassemblySourceGroup = {
	name: 'Projectiles',
	items: [
		// Darts
		{ item: i('Bronze dart'), lvl: 1 },
		{ item: i('Iron dart'), lvl: 10 },
		{ item: i('Steel dart'), lvl: 20 },
		{
			item: i('Black dart'),
			lvl: 25
		},
		{ item: i('Mithril dart'), lvl: 30 },
		{ item: i('Adamant dart'), lvl: 30 },
		{ item: i('Rune dart'), lvl: 50 },
		{ item: i('Amethyst dart'), lvl: 50 },
		{ item: i('Dragon dart'), lvl: 60, flags: new Set(['orikalkum']) },
		// Javelins
		{ item: i('Bronze javelin'), lvl: 1 },
		{ item: i('Iron javelin'), lvl: 10 },
		{ item: i('Steel javelin'), lvl: 20 },
		{ item: i('Mithril javelin'), lvl: 30 },
		{ item: i('Adamant javelin'), lvl: 30 },
		{ item: i('Rune javelin'), lvl: 50 },
		{ item: i('Dragon javelin'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i("Morrigan's javelin"), lvl: 78 },
		// Arrows
		{ item: i('Bronze arrow'), lvl: 1 },
		{ item: i('Bronze brutal'), lvl: 2 },
		{ item: i('Iron arrow'), lvl: 5 },
		{ item: i('Iron brutal'), lvl: 5 },
		{ item: i('Steel brutal'), lvl: 7 },
		{ item: i('Steel arrow'), lvl: 10 },
		{ item: i('Mithril brutal'), lvl: 11 },
		{ item: i('Mithril arrow'), lvl: 15 },
		{ item: i('Ogre arrow'), lvl: 15 },
		{ item: i('Rune brutal'), lvl: 21 },
		{ item: i('Adamant arrow'), lvl: 25 },
		{ item: i('Rune arrow'), lvl: 25 },
		{ item: i('Dragon arrow'), lvl: 30, flags: new Set(['orikalkum']) },
		// Knives
		{ item: i('Bronze knife'), lvl: 1 },
		{ item: i('Iron knife'), lvl: 10 },
		{ item: i('Steel knife'), lvl: 20 },
		{
			item: i('Black knife'),
			lvl: 25
		},
		{ item: i('Mithril knife'), lvl: 30 },
		{ item: i('Adamant knife'), lvl: 40 },
		{ item: i('Rune knife'), lvl: 50 },
		{ item: i('Dragon knife'), lvl: 60, flags: new Set(['orikalkum']) },
		// Bolts
		{ item: i('Bronze bolts'), lvl: 1 },
		{ item: i('Iron bolts'), lvl: 5 },
		{ item: i('Opal bolts'), lvl: 5 },
		{ item: i('Opal bolts (e)'), lvl: 10 },
		{ item: i('Pearl bolts'), lvl: 10 },
		{ item: i('Steel bolts'), lvl: 10 },
		{ item: i('Jade bolts'), lvl: 12 },
		{ item: i('Silver bolts'), lvl: 12 },
		{ item: i('Bone bolts'), lvl: 14 },
		{ item: i('Pearl bolts (e)'), lvl: 15 },
		{ item: i('Topaz bolts'), lvl: 15 },
		{ item: i('Jade bolts (e)'), lvl: 17 },
		{ item: i('Sapphire bolts'), lvl: 20 },
		{ item: i('Topaz bolts (e)'), lvl: 20 },
		{ item: i('Emerald bolts'), lvl: 25 },
		{ item: i('Ruby bolts'), lvl: 25 },
		{ item: i('Sapphire bolts (e)'), lvl: 25 },
		{ item: i('Diamond bolts'), lvl: 30 },
		{ item: i('Emerald bolts (e)'), lvl: 30 },
		{ item: i('Ruby bolts (e)'), lvl: 30 },
		{ item: i('Bolt rack'), lvl: 35 },
		{ item: i('Broad bolts'), lvl: 35 },
		{ item: i('Diamond bolts (e)'), lvl: 35 },
		{ item: i('Onyx bolts'), lvl: 35 },
		{ item: i('Onyx bolts (e)'), lvl: 40 },
		{ item: i('Mithril bolts'), lvl: 40 },
		{ item: i('Adamant bolts'), lvl: 50 },
		{ item: i('Adamant bolts (unf)'), lvl: 50 },
		{ item: i('Runite bolts'), lvl: 50 },
		{ item: i('Runite bolts (unf)'), lvl: 50 },
		{ item: i('Amethyst broad bolts'), lvl: 55 },
		{ item: i('Dragon bolts'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i('Dragon bolts (unf)'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i('Dragonstone bolts (e)'), lvl: 71 },
		{ item: i('Onyx dragon bolts'), lvl: 84 }
	],
	parts: { simple: 10, swift: 30, sharp: 60 }
};
