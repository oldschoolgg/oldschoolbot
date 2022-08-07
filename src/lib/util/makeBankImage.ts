import { MessageAttachment } from 'discord.js';
import { KlasaUser } from 'klasa';
import { MahojiAttachment } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import BankImageTask, { BankFlag } from '../../tasks/bankImage';
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
}: MakeBankImageOptions): Promise<{
	file: MahojiAttachment;
}> {
	let realFlags: Flags = { ...flags, background: background ?? 1, nocache: 1 };
	if (showNewCL || previousCL !== undefined) realFlags.showNewCL = 1;
	const { image, isTransparent } = await (globalClient.tasks.get('bankImage')! as BankImageTask).generateBankImage({
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
			fileName: isTransparent ? 'bank.png' : 'bank.jpg',
			buffer: image!
		}
	};
}

export async function makeBankImageKlasa(opts: MakeBankImageOptions) {
	const result = await makeBankImage(opts);
	return { files: [new MessageAttachment(result.file.buffer)] };
}
