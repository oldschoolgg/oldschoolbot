import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { VoteTable } from '../../lib/typeorm/VoteTable.entity';

export default class POHCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Allows you to access and build in your POH.',
			examples: ['+poh build demonic throne', '+poh', '+poh items', '+poh destroy demonic throne'],
			subcommands: true,
			usage: '[create|delete|vote|list] [input:...str]',
			usageDelim: ' ',
			aliases: ['poll']
		});
	}

	async list(msg: KlasaMessage) {
		const posts = await VoteTable.createQueryBuilder()
			.orderBy('cardinality(yes_voters)+cardinality(no_voters)')
			.limit(10)
			.getMany();
		return msg.channel.send(`Top 10 Most Voted Polls:
${posts.map(p => p.title()).join('\n')}`);
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const myPolls = await VoteTable.find({
			userID: msg.author.id
		});
		if (myPolls.length === 0) return msg.channel.send('You have no polls.');
		let str = 'Your polls:\n';
		for (const poll of myPolls) {
			str += `\n${poll.title()}`;
		}
		return msg.channel.send(str);
	}

	async vote(msg: KlasaMessage, [str]: [string | undefined]) {
		if (!str) return;
		const [_id, vote] = str.split(' ');
		const id = Number(_id);
		if (isNaN(id)) return msg.channel.send('Invalid id.');
		if (!['yes', 'no'].includes(vote)) return msg.channel.send('Invalid vote.');
		const poll = await VoteTable.findOne({
			where: {
				id
			}
		});

		if (!poll) {
			return msg.channel.send('No poll found with that id.');
		}
		if (poll.yesVoters.includes(msg.author.id)) {
			return msg.channel.send('You already voted yes.');
		}
		if (poll.noVoters.includes(msg.author.id)) {
			return msg.channel.send('You already voted no.');
		}
		const key = vote === 'yes' ? 'yesVoters' : 'noVoters';

		poll[key].push(msg.author.id);
		await poll.save();
		return msg.channel.send(`You voted ${vote} on ${poll.title()}.`);
	}

	async create(msg: KlasaMessage, [text]: [string | undefined]) {
		if (!text || text.length < 2 || text.length > 1000) {
			return msg.channel.send('no text?!');
		}

		const howManyPollsMade = await VoteTable.find({
			userID: msg.author.id
		});
		const limit = msg.author.perkTier >= PerkTier.Four ? 5 : 1;
		if (howManyPollsMade.length >= limit) {
			return msg.channel.send("You can't make anymore polls.");
		}

		await msg.confirm(
			'Are you sure you want to create this poll? Creating fake, invalid, spam, troll, or inappropriate polls will result in a ban.'
		);

		const poll = new VoteTable();
		poll.userID = msg.author.id;
		poll.noVoters = [];
		poll.yesVoters = [];
		poll.text = text;
		poll.createdAt = new Date();
		await poll.save();
		return msg.channel.send(`You created a new poll: ${poll.title()}`);
	}

	async delete(msg: KlasaMessage, [_id]: [string | undefined]) {
		const id = Number(_id);
		if (isNaN(id)) return msg.channel.send('Invalid id.');
		const poll = await VoteTable.findOne({
			where: {
				userID: msg.author.id,
				id
			}
		});
		if (!poll) {
			return msg.channel.send('No poll found with that id.');
		}
		await msg.confirm(`Are you sure you want to delete ${poll.title}?`);
		await poll.remove();
		return msg.channel.send('Deleted.');
	}
}
