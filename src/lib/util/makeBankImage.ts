import { KlasaUser } from 'klasa';
import { MahojiAttachment } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

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
	let realFlags: Record<string, string | number> = { ...flags, background: background ?? 1, ...flags, nocache: 1 };
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
