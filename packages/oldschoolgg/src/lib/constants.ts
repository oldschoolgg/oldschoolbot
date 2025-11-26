import type { IKickChatMessage } from '@worp/kick-schemas/websocketSchemas';
import type { FlatKickMessage } from '@worp/universal/types';

export const kickChatEmojiRegex = /\[emote:(\d+):([a-zA-Z0-9-_!]*)\]/g;

export function flattenKickMessage(msg: IKickChatMessage): FlatKickMessage {
	const flatMessage: FlatKickMessage = {
		id: msg.id,
		content: msg.content,
		sender_id: msg.sender.id,
		sender_username: msg.sender.username ?? 'Unknown',
		sender_slug: msg.sender.slug ?? 'unknown',
		sender_color: msg.sender.identity?.color ?? '#000',
		is_subscriber: false,
		is_moderator: false,
		is_vip: false,
		is_founder: false,
		is_broadcaster: false,
		is_verified: false,
		is_sub_gifter: false,
		months_subbed: 0,
		subs_gifted: 0,
		is_og: false,
		chatroom_id: msg.chatroom_id ?? 0,
		created_at: new Date(msg.created_at)?.getTime()
	};

	for (const badge of msg.sender.identity?.badges ?? []) {
		switch (badge.type) {
			case 'vip':
				flatMessage.is_vip = true;
				break;
			case 'founder':
				flatMessage.is_founder = true;
				break;
			case 'sub_gifter':
				flatMessage.is_sub_gifter = true;
				flatMessage.subs_gifted = badge.count ?? 0;
				break;
			case 'og':
				flatMessage.is_og = true;
				break;
			case 'subscriber':
				flatMessage.is_subscriber = true;
				flatMessage.months_subbed = badge.count ?? 0;
				break;
			case 'moderator':
				flatMessage.is_moderator = true;
				break;
			case 'broadcaster':
				flatMessage.is_moderator = true;
				flatMessage.is_broadcaster = true;
				break;
			case 'verified':
				flatMessage.is_verified = true;
				break;

			case 'bot': {
				// Ignore
				break;
			}
			default: {
				console.log('Unknown badge type:', badge);
			}
		}
	}

	return flatMessage;
}
