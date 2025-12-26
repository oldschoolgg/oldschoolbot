import './capes.js';
import './inventions.js';

import { setCustomItem } from '@/lib/customItems/util.js';

setCustomItem(
	63_400,
	'Cogsworth',
	'Herbi',
	{
		customItemData: {
			cantDropFromMysteryBoxes: true,
			isSuperUntradeable: true
		}
	},
	1_000_000
);
