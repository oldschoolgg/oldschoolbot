import type { Bank } from 'oldschooljs';

import type { BankFlag } from '../bankImage';
import type { Flags } from '../minions/types';
import { Stopwatch } from '@oldschoolgg/toolkit';

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
	const realFlags: Flags = { ...flags, background: background ?? 1, nocache: 1 };
	if (showNewCL || previousCL !== undefined) realFlags.showNewCL = 1;

	const stopwatch = new Stopwatch();
	const { image, isTransparent } = await bankImageGenerator.generateBankImage({
		bank,
		title,
		showValue: true,
		flags: realFlags,
		user,
		collectionLog: previousCL,
		mahojiFlags
	});
	console.log(`Generated bank image in ${stopwatch.stop()}`);

	return {
		file: {
			name: isTransparent ? 'bank.png' : 'bank.jpg',
			attachment: image!
		}
	};
}
