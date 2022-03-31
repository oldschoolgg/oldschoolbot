import { KlasaUser } from 'klasa';
import { MahojiAttachment } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { client } from '../..';

interface MakeBankImageOptions {
	bank: Bank;
	content?: string;
	title?: string;
	background?: number;
	flags?: Record<string, string | number>;
	user?: KlasaUser;
	cl?: Bank;
}

export async function makeBankImage({ bank, title, background, flags, user, cl }: MakeBankImageOptions): Promise<{
	file: MahojiAttachment;
}> {
	const { image, isTransparent } = await client.tasks
		.get('bankImage')!
		.generateBankImage(bank, title, true, { background: background ?? 1, ...flags, nocache: 1 }, user, cl);

	return {
		file: {
			fileName: isTransparent ? 'bank.png' : 'bank.jpg',
			buffer: image!
		}
	};
}
