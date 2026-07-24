import {
	bitfieldCanUserManipulate,
	changeBitFieldForUser,
	getBitFieldData,
	listBitFields
} from '@/lib/bitFieldUtils.js';

interface TestPotatoBitfieldOptions {
	add?: string;
	remove?: string;
}

export function handleTestPotatoBitfield(user: MUser, options: TestPotatoBitfieldOptions) {
	if (!options.add && !options.remove) {
		return 'you must choose a valid bitfield from either add or remove';
	}

	const bitInput = options.add ?? options.remove!;
	const bit = getBitFieldData(bitInput);
	const action: 'add' | 'remove' = options.add ? 'add' : 'remove';
	if (!bit) return listBitFields(user);
	const canManipulate = bitfieldCanUserManipulate({ user, bit });
	if (canManipulate !== true) return canManipulate;
	return changeBitFieldForUser(user, bit.bit, action);
}
