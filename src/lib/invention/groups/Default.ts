import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

export const Default: DisassemblySourceGroup = {
	name: 'Default',
	items: [
		{ item: getOSItem('Ball of wool'), lvl: 1 },
		{ item: getOSItem('Blue dragon scale'), lvl: 1 },
		{ item: getOSItem('Blue firelighter'), lvl: 1 },
		{ item: getOSItem('Bow string'), lvl: 1 },
		{ item: getOSItem('Bronze dart tip'), lvl: 1 },
		{ item: getOSItem('Bronze feather'), lvl: 1 },
		{ item: getOSItem('Bronze nails'), lvl: 1 },
		{ item: getOSItem('Feather'), lvl: 1 },
		{
			item: getOSItem('Fury ornament kit'),
			lvl: 1
		},
		{ item: getOSItem('Grapes'), lvl: 1 },
		{ item: getOSItem('Holy elixir'), lvl: 1 },
		{ item: getOSItem('Rune dart tip'), lvl: 1 },
		{ item: getOSItem('Rune nails'), lvl: 1 },
		{ item: getOSItem('Sapphire glacialis'), lvl: 1 },
		{ item: getOSItem('Silk'), lvl: 1 },
		{ item: getOSItem('Sinew'), lvl: 1 },
		{ item: getOSItem('Snapdragon potion (unf)'), lvl: 1 },
		{ item: getOSItem('Snowy knight'), lvl: 1 },
		{ item: getOSItem('Soda ash'), lvl: 1 },
		{ item: getOSItem('Soft clay'), lvl: 1 },
		{ item: getOSItem('Steel dart tip'), lvl: 1 },
		{ item: getOSItem('Steel nails'), lvl: 1 },
		{ item: getOSItem('Pure essence'), lvl: 10 },
		{ item: getOSItem('Rune essence'), lvl: 10 }
	],
	parts: { simple: 99 }
};
