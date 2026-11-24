import type { BaseSendableMessage } from '@oldschoolgg/discord';

const MAX_MESSAGE_LENGTH = 1950;

function splitContentIntoMessages(content: string): string[] {
	if (content.length <= MAX_MESSAGE_LENGTH) return [content];

	const parts: string[] = [];
	let remaining = content;
	while (remaining.length > MAX_MESSAGE_LENGTH) {
		let splitAt = remaining.lastIndexOf(String.fromCharCode(10), MAX_MESSAGE_LENGTH);
		if (splitAt <= 0) {
			splitAt = Math.max(
				remaining.lastIndexOf(' ', MAX_MESSAGE_LENGTH),
				remaining.lastIndexOf(String.fromCharCode(9), MAX_MESSAGE_LENGTH)
			);
		}
		if (splitAt <= 0) {
			splitAt = MAX_MESSAGE_LENGTH;
		}
		parts.push(remaining.slice(0, splitAt));
		remaining = remaining.slice(splitAt);
	}
	if (remaining.length > 0) {
		parts.push(remaining);
	}
	return parts;
}

export function splitSendableMessage(rawMessage: BaseSendableMessage): BaseSendableMessage[] {
	const content = rawMessage.content ?? '';
	const contentParts = splitContentIntoMessages(content);
	if (contentParts.length === 1) return [rawMessage];

	return contentParts.map((part, index) =>
		index === contentParts.length - 1
			? { ...rawMessage, content: part }
			: { content: part, allowedMentions: rawMessage.allowedMentions, ephemeral: rawMessage.ephemeral }
	);
}
