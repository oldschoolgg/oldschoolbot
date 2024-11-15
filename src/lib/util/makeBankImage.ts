import type { Bank } from 'oldschooljs';

import type { BankFlag } from '../bankImage';
import type { Flags } from '../minions/types';

interface MakeBankImageOptions {
	bank: Bank;
	content?: string;
	title?: string;
	background?: number;
	spoiler?: boolean;
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
	spoiler,
	showNewCL = false,
	flags = {},
	mahojiFlags = []
}: MakeBankImageOptions) {
	const realFlags: Flags = { ...flags, background: background ?? 1, nocache: 1 };
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
			name: `${spoiler ? 'SPOILER_' : ''}${isTransparent ? 'bank.png' : 'bank.jpg'}`,
			attachment: image!
		}
	};
}
