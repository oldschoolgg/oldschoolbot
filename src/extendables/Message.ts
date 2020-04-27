import { Extendable, ExtendableStore, KlasaMessage, KlasaUser } from 'klasa';
import { Message, MessageAttachment } from 'discord.js';
import { Bank, MakePartyOptions } from '../lib/types';
import { removeDuplicatesFromArray } from '../lib/util';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	get cmdPrefix(this: KlasaMessage) {
		return this.guild ? this.guild.settings.get('prefix') : '+';
	}

	async sendLarge(
		this: KlasaMessage,
		content: any,
		fileName = 'large-response.txt',
		messageTooLong = 'Response was too long, please see text file.'
	) {
		if (content.length <= 2000 && !this.flagArgs.file) return this.send(content);

		return this.channel.sendFile(Buffer.from(content), fileName, messageTooLong);
	}

	async sendBankImage(
		this: KlasaMessage,
		{ bank, content, title }: { bank: Bank; content?: string; title?: string }
	) {
		const image = await this.client.tasks.get('bankImage')!.generateBankImage(bank, title);
		return this.send(content, new MessageAttachment(image));
	}

	async makeInviteParty(this: KlasaMessage, options: MakePartyOptions) {
		// Remove any duplicates from the users, incase they passed the same user several times.
		const users = removeDuplicatesFromArray(options.users);

		if (options.users.length === 0) {
			throw new Error(`No users for the party were specified.`);
		}

		if (options.users.length > options.maxSize || options.users.length < options.minSize) {
			throw new Error(
				`This party must have atleast ${options.minSize} users, and no more than ${options.maxSize}, your party had ${options.users.length} users.`
			);
		}

		const usersWithoutLeader = users.filter(user => user.id !== options.leader.id);

		const confirmMessage = await this.channel.send(options.message);
		const usersWhoConfirmed: KlasaUser[] = [];

		try {
			const confirmMessages = await this.channel.awaitMessages(
				_msg => {
					if (
						usersWithoutLeader.includes(_msg.author) &&
						_msg.content.toLowerCase() === options.joinWord
					) {
						usersWhoConfirmed.push(_msg.author);

						const confirmed =
							usersWhoConfirmed.length === usersWithoutLeader.length
								? `Everyone!`
								: usersWhoConfirmed.map(u => u.username).join(', ');

						confirmMessage.edit(`${options.message}\n\nConfirmed Users: ${confirmed}`);
						return true;
					}
					return false;
				},
				{
					max: usersWithoutLeader.length,
					time: 45_000,
					errors: ['time']
				}
			);

			if (confirmMessages.size !== usersWithoutLeader.length) {
				throw new Error(`The party invite wasn't accepted by everyone.`);
			}

			for (const user of usersWithoutLeader) {
				if (!confirmMessages.some(_msg => _msg.author.id === user.id)) {
					throw new Error(`${user.username} didn't accept the invite.`);
				}
			}
		} catch (err) {
			throw typeof err === 'string'
				? new Error(err)
				: new Error('The time ran out, not everyone accepted the invite.');
		}
	}
}
