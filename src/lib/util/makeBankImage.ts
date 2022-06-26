import { KlasaUser } from 'klasa';
import { MahojiAttachment } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { Flags } from '../minions/types';

interface MakeBankImageOptions {
	bank: Bank;
	content?: string;
	title?: string;
	background?: number;
	flags?: Record<string, string | number>;
	user?: KlasaUser;
	previousCL?: Bank;
	showNewCL?: boolean;
}

export async function makeBankImage({
	bank,
	title,
	background,
	user,
	previousCL,
	showNewCL,
	flags = {}
}: MakeBankImageOptions): Promise<{
	file: MahojiAttachment;
}> {
	let realFlags: Flags = { ...flags, background: background ?? 1, nocache: 1 };
	if (showNewCL) realFlags.showNewCL = 1;
	const { image, isTransparent } = await globalClient.tasks
		.get('bankImage')!
		.generateBankImage(bank, title, true, realFlags, user, previousCL);

	return {
		file: {
			fileName: isTransparent ? 'bank.png' : 'bank.jpg',
			buffer: image!
		}
	};
}
