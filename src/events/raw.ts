import { Event, EventStore } from 'klasa';

import { HAPPY_EMOJI_ID, SAD_EMOJI_ID, VOTE_CHANNEL_ID } from '../lib/constants';
import { VoteTable } from '../lib/typeorm/VoteTable.entity';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			once: false,
			event: 'raw'
		});
	}

	async run(rawEvent: any) {
		if (!['MESSAGE_REACTION_REMOVE', 'MESSAGE_REACTION_ADD'].includes(rawEvent.t)) {
			return;
		}
		const data = rawEvent.d;
		if (data.channel_id !== VOTE_CHANNEL_ID) return;
		if (!data.emoji || !data.emoji.id || ![HAPPY_EMOJI_ID, SAD_EMOJI_ID].includes(data.emoji.id)) {
			return;
		}

		if (!data.member || data.member.user.bot) return;

		const poll = await VoteTable.findOne({
			where: {
				messageID: data.message_id
			}
		});
		if (poll) {
			if (poll.yesVoters.includes(data.member.user.id)) {
				return;
			}
			if (poll.noVoters.includes(data.member.user.id)) {
				return;
			}
			const key = data.emoji.id === HAPPY_EMOJI_ID ? 'yesVoters' : 'noVoters';

			poll[key].push(data.member.user.id);
			await poll.save();
		}
	}
}
