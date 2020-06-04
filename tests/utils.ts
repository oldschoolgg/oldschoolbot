import { KlasaUser } from 'klasa';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearTypes } from '../src/lib/gear';
import { initItemAliases } from '../src/lib/itemAliases';
import { UserSettings } from '../src/lib/settings/types/UserSettings';
import { ItemBank } from '../src/lib/types';
import { itemID, resolveNameBank } from '../src/lib/util';

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

type PartialGearSetup = Partial<
	{
		[key in EquipmentSlot]: string;
	}
>;

export function constructGearSetup(setup: PartialGearSetup): GearTypes.GearSetup {
	return {
		'2h': setup['2h'] ? { item: itemID(setup['2h']), quantity: 1 } : null,
		ammo: setup.ammo ? { item: itemID(setup.ammo), quantity: 1 } : null,
		body: setup.body ? { item: itemID(setup.body), quantity: 1 } : null,
		cape: setup.cape ? { item: itemID(setup.cape), quantity: 1 } : null,
		feet: setup.feet ? { item: itemID(setup.feet), quantity: 1 } : null,
		hands: setup.hands ? { item: itemID(setup.hands), quantity: 1 } : null,
		head: setup.head ? { item: itemID(setup.head), quantity: 1 } : null,
		legs: setup.legs ? { item: itemID(setup.legs), quantity: 1 } : null,
		neck: setup.neck ? { item: itemID(setup.neck), quantity: 1 } : null,
		ring: setup.ring ? { item: itemID(setup.ring), quantity: 1 } : null,
		shield: setup.shield ? { item: itemID(setup.shield), quantity: 1 } : null,
		weapon: setup.weapon ? { item: itemID(setup.weapon), quantity: 1 } : null
	};
}

export async function testSetup() {
	initItemAliases();
}

export function mockKlasaUser(otherSettings: Record<string, any> = {}): KlasaUser {
	const defaultSettings = {
		bank: resolveNameBank({ 'Fishing bait': 1000 }),
		GP: 1000,
		...otherSettings
	};
	const settings = new Map(Object.entries(defaultSettings));

	return ({
		minionName: 'nugget',
		maxTripLength: 1000,
		settings,
		numItemsInBankSync(id: number) {
			const bank = settings.get(UserSettings.Bank) as ItemBank;

			const result = bank[id];

			if (typeof result !== 'undefined') {
				return result;
			}

			return 0;
		}
	} as unknown) as KlasaUser;
}
