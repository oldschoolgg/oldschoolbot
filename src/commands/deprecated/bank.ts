import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';
import { makeBankImageKlasa } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows your bank, with all your items and GP.',
			usage: '[page:int{1}] [name:...string]',
			usageDelim: ' ',
			requiredPermissionsForBot: ['ATTACH_FILES'],
			aliases: ['b', 'bs'],
			examples: ['+b'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [page = undefined, itemNameOrID = '']: [number | undefined, string | undefined]) {
		const baseBank = msg.author.bankWithGP;

		if (msg.commandText === 'bs') {
			if (page && !itemNameOrID) {
				itemNameOrID = String(page);
				page = undefined;
			}
			msg.flagArgs.search = String(itemNameOrID).trim().replace(/"/g, '');
			// Clear item string
			itemNameOrID = '';
		} else if (page && itemNameOrID) {
			itemNameOrID = `${page} ${itemNameOrID}`.trim();
			page = undefined;
		}
		if (!page) page = 1;

		if (baseBank.length === 0) {
			return msg.channel.send(
				`You have no items or GP yet ${Emoji.Sad} You can get some GP by using the +daily command, and you can get items by sending your minion to do tasks.`
			);
		}

		const bank = parseBank({
			inputBank: baseBank,
			flags: msg.flagArgs,
			inputStr: itemNameOrID,
			user: msg.author
		});

		if (bank.length === 0) {
			return msg.channel.send('No items found.');
		}

		return msg.channel.send({
			content:
				'Start using the `/bank` slash command! This command will be removed soon as we fully migrate to slash commands.',
			...(await makeBankImageKlasa({
				bank,
				title: `${msg.author.username}'s Bank`,
				flags: {
					...msg.flagArgs,
					page: page - 1
				},
				user: msg.author
			}))
		});
	}
}
