import type { Bank } from 'oldschooljs';

import type { Flags } from '@/lib/minions/types.js';
import { type BankFlag, bankImageTask } from '../canvas/bankImage.js';
import type { IconPackID } from '../canvas/iconPacks.js';

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
	iconPackId?: IconPackID;
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
	mahojiFlags = [],
	iconPackId
}: MakeBankImageOptions) {
	const realFlags: Flags = { ...flags, background: background ?? 1, nocache: 1 };
	if (showNewCL || previousCL !== undefined) realFlags.showNewCL = 1;

	const { image } = await bankImageTask.generateBankImage({
		bank,
		title,
		showValue: true,
		flags: realFlags,
		user,
		collectionLog: previousCL,
		mahojiFlags,
		iconPackId
	});

	return {
		file: {
			name: `${spoiler ? 'SPOILER_' : ''}bank.png`,
			attachment: image!
		}
	};
}
