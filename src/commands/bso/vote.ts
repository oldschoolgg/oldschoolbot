import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { VoteTable } from '../../lib/typeorm/VoteTable.entity';
import { Util } from '../../lib/util';

export default class POHCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion'],
			subcommands: true,
			usage: '[create|delete|vote|search] [input:...str]',
			usageDelim: ' ',
			aliases: ['poll', 'p']
		});
	}

	async search(msg: KlasaMessage, [input = '']: [string | undefined]) {
		const result = await VoteTable.createQueryBuilder()
			.select()
			.where('text ILIKE :searchTerm', { searchTerm: `%${input.replace(/[\W_]+/g, '')}%` })
			.limit(10)
			.getMany();

		return msg.channel.send(`Poll Search Results:
${result.map(p => p.title()).join('\n')}`);
	}

	async list(msg: KlasaMessage) {
		return msg.channel.send('');
	}

	@requiresMinion
	async run(msg: KlasaMessage, [_id]: [string | undefined]) {
		if (_id) {
			const id = Number(_id);
			if (isNaN(id)) return msg.channel.send('Invalid id.');
			const poll = await VoteTable.findOne({
				where: {
					id
				}
			});

			if (!poll) {
				return msg.channel.send('No poll found with that id.');
			}
			return msg.channel.send(`${poll.title()}
\`\`\`
${Util.escapeMarkdown(poll.text)}
\`\`\`

Vote Yes: \`=poll vote ${poll.id} yes\`
Vote No: \`=poll vote ${poll.id} no\`
`);
		}

		const myPolls = await VoteTable.find({
			userID: msg.author.id
		});
		const posts = await VoteTable.createQueryBuilder()
			.orderBy('cardinality(yes_voters)+cardinality(no_voters)', 'DESC')
			.limit(10)
			.getMany();
		const mostUpvotes = await VoteTable.createQueryBuilder()
			.orderBy('cardinality(yes_voters)', 'DESC')
			.limit(10)
			.getMany();

		return msg.channel.send(`**Your Polls:**
${myPolls.map(p => p.title()).join('\n')}

**Top 10 Most Voted Polls:**
${posts.map(p => p.title()).join('\n')}

**Top 10 Most Upvoted:**
${mostUpvotes.map(p => p.title()).join('\n')}`);
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
			return msg.channel.send('You already voted yes on this poll.');
		}
		if (poll.noVoters.includes(msg.author.id)) {
			return msg.channel.send('You already voted no on this poll.');
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
		await msg.confirm(`Are you sure you want to delete ${poll.title()}?`);
		await poll.remove();
		return msg.channel.send('Deleted.');
	}
}
