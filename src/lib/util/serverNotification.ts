import { Events } from '@oldschoolgg/toolkit';

export function sendServerNotification({
	user,
	item,
	quantity = 1,
	action,
	activity,
	level,
	skill,
	emoji = ''
}: {
	user: MUser;
	item: string;
	quantity?: number;
	action: string;
	activity: string;
	level: number;
	skill: string;
	emoji?: string;
}) {
	if (user.cl.has(item)) return;

	const itemDescription = quantity > 1 ? `${quantity}x ${item}` : `a ${item}`;
	const emojiPrefix = emoji ? `${emoji} ` : '';

	globalClient.emit(
		Events.ServerNotification,
		`${emojiPrefix}**${user.badgedUsername}'s** minion, ${user.minionName}, just received ${itemDescription} while ${action} ${activity} at level ${level} ${skill}!`
	);
}
