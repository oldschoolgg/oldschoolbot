import './capes';
import './inventions';

import { setCustomItem } from '../util';

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
