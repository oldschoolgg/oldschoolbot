import { KlasaClient } from 'klasa';

import { ClientSettings } from './settings/types/ClientSettings';
import { formatDuration } from './util';
import { sendToChannelID } from './util/webhook';

export function isDoubleLootActive(client: KlasaClient) {
	return Date.now() < client.settings.get(ClientSettings.DoubleLootFinishTime);
}

export async function addToDoubleLootTimer(client: KlasaClient, amount: number, reason: string) {
	let current = client.settings.get(ClientSettings.DoubleLootFinishTime);
	console.log({ current });
	if (current < Date.now()) {
		current = Date.now();
	}
	await client.settings.update(ClientSettings.DoubleLootFinishTime, current + amount);
	sendToChannelID(client, '665678499578904596', {
		content: `${formatDuration(amount)} added to the Double Loot timer because: ${reason}.`
	});
}
