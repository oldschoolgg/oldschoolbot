import { Bank } from 'oldschooljs';

import { BankFlag } from '../bankImage';
import { Flags } from '../minions/types';

interface MakeBankImageOptions {
	bank: Bank;
	content?: string;
	title?: string;
	background?: number;
	flags?: Record<string, string | number>;
	user?: MUser;
	previousCL?: Bank;
	showNewCL?: boolean;
	mahojiFlags?: BankFlag[];
}

export async function makeBankImage({
	bank,
	title,
	background,
	user,
	previousCL,
	showNewCL = false,
	flags = {},
	mahojiFlags = []
}: MakeBankImageOptions) {
	let realFlags: Flags = { ...flags, background: background ?? 1, nocache: 1 };
	if (showNewCL || previousCL !== undefined) realFlags.showNewCL = 1;
	const { image, isTransparent } = await bankImageGenerator.generateBankImage({
		bank,
		title,
		showValue: true,
		flags: realFlags,
		user,
		collectionLog: previousCL,
		mahojiFlags
	});

	return {
		file: {
			name: isTransparent ? 'bank.png' : 'bank.jpg',
			attachment: image!
		}
	};
}
