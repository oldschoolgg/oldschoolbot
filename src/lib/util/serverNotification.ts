import { Events } from '@oldschoolgg/toolkit';

type ServerNotificationOptions = {
	user: MUser;
	item: string;
	quantity?: number;
	action: string;
	activity: string;
	level: number;
	skill: string;
	emoji?: string;
};

export function buildServerNotification({
	user,
	item,
	quantity = 1,
	action,
	activity,
	level,
	skill,
	emoji = ''
}: ServerNotificationOptions) {
	if (user.cl.has(item)) return undefined;

	const itemDescription = quantity > 1 ? `${quantity}x ${item}` : `a ${item}`;
	const emojiPrefix = emoji ? `${emoji} ` : '';

	return `${emojiPrefix}**${user.badgedUsername}'s** minion, ${user.minionName}, just received ${itemDescription} while ${action} ${activity} at level ${level} ${skill}!`;
}

export function sendServerNotification(options: ServerNotificationOptions) {
	const message = buildServerNotification(options);
	if (!message) return;

	globalClient.emit(Events.ServerNotification, message);
}
