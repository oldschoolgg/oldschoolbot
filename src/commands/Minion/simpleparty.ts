import { CommandStore, KlasaUser, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { Emoji } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<mass|party> [users:...user]',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true,
			altProtection: true,
			subcommands: true
		});
	}

	async mass(msg: KlasaMessage) {
		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 1,
			maxSize: 50,
			message: `${msg.author.username} is doing amass! Anyone can click the ${Emoji.Tick} reaction to join.`
		};

		let users: KlasaUser[] = [];
		try {
			users = await msg.makeMassParty(partyOptions);
		} catch (err) {
			return msg.send(err.message);
		}

		return msg.channel.send(
			`${partyOptions.leader.username}'s party (${users
				.map(u => u.username)
				.join(', ')}) is now off to do a mass.`
		);
	}

	async party(msg: KlasaMessage, [usersInput = []]: [KlasaUser[]]) {
		if (usersInput.length === 0) throw `You need to invite some people to your party!`;
		if (usersInput.includes(msg.author)) {
			throw `You can't invite yourself to your own party!`;
		}

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			usersAllowed: usersInput.map(u => u.id),
			minSize: 1,
			maxSize: 50,
			message: `${msg.author.username} has invited ${usersInput.length} people to join their party! Click the ${Emoji.Tick} reaction to join.`
		};

		let users: KlasaUser[] = [];
		try {
			users = await msg.makeInviteParty(partyOptions);
		} catch (err) {
			return msg.send(err.message);
		}

		return msg.channel.send(
			`${partyOptions.leader.username}'s party (${users
				.map(u => u.username)
				.join(', ')}) is now off to do a group party trip!`
		);
	}
}
