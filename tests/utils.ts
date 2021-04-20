import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearSetup } from '../src/lib/gear';
import { itemID } from '../src/lib/util';

export function mockArgument(arg: any) {
	return new arg(
		{
			name: 'arguments',
			client: {
				options: {
					pieceDefaults: {
						arguments: {}
					}
				}
			}
		},
		['1'],
		'',
		{}
	);
}
