import { removeFromArr, uniqueArr } from '@oldschoolgg/toolkit';
import { MathRNG } from 'node-rng';

import { type BitField, BitFieldData, globalConfig, type IBitFieldData } from '@/lib/constants.js';
import { isValidBitField } from '@/lib/util/smallUtils.js';
import { gifs } from '@/mahoji/commands/admin.js';

export type BitFieldReturnData<T extends IBitFieldData = IBitFieldData> =
	| {
			bit: BitField;
			data: T;
	  }
	| false;

export function getBitFieldData<T extends IBitFieldData = IBitFieldData>(
	inputString: string,
	dataMap: Record<BitField, T> = BitFieldData as Record<BitField, T>
): BitFieldReturnData<T> {
	const bitEntry = Object.entries(dataMap).find(([key]) => key === inputString);
	if (!bitEntry) return false;
	const bit = Number.parseInt(bitEntry[0]);
	if (!isValidBitField(bit)) return false;
	return {
		bit,
		data: bitEntry[1]
	};
}

export function validateBitFieldReturn<T extends IBitFieldData = IBitFieldData>(
	bit: BitFieldReturnData<T>
): bit is Exclude<BitFieldReturnData<T>, false> {
	return bit !== false;
}

export function bitfieldCanUserManipulate<T extends IBitFieldData = IBitFieldData>({
	user,
	bit,
	target,
	bfData = BitFieldData as Record<BitField, T>
}: {
	user: MUser;
	bit: number | BitField | Exclude<BitFieldReturnData<T>, false>;
	target?: MUser | undefined;
	bfData?: Record<BitField, T>;
}): true | string {
	if (typeof bit === 'number') {
		if (!isValidBitField(bit)) return 'Invalid bitfield.';
		bit = { bit, data: bfData[bit] };
	}
	if (user.isAdmin()) return true;
	if (bit.data.protected) {
		return 'OOK! OOK!You cannot modify this bit -- ook ook';
	}
	if (!globalConfig.isProduction || user.isMod()) return true;
	if (target) {
		return MathRNG.pick(gifs);
	}
	if (!bit.data.userConfigurable) {
		return 'Nice try, but this bit is not for you.😛';
	}
	return true;
}

export async function changeBitFieldForUser(user: MUser, bit: BitField, action: 'remove' | 'add' | 'toggle') {
	let newBits = [...user.bitfield];
	if (action === 'toggle') {
		action = newBits.includes(bit) ? 'remove' : 'add';
	}

	if (action === 'add') {
		if (newBits.includes(bit)) {
			return "Already has this bit, so can't add.";
		}
		newBits.push(bit);
	} else {
		if (!newBits.includes(bit)) {
			return "Doesn't have this bit, so can't remove.";
		}
		newBits = removeFromArr(newBits, bit);
	}

	await user.update({
		bitfield: uniqueArr(newBits)
	});

	const aor = () => action === 'add';
	return `${aor() ? 'Added' : 'Removed'} '${BitFieldData[bit].name}' bit ${aor() ? 'to' : 'from'} ${user.usernameOrMention}.`;
}

export function listBitFields(user?: MUser, dataMap: Record<BitField, IBitFieldData> = BitFieldData) {
	return Object.entries(dataMap)
		.filter(([, data]) => !(data.protected && user && !user.isAdmin()))
		.map(([key, data]) => `**${key}:** ${data.name}`)
		.join('\n');
}
