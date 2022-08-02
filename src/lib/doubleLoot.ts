import { Time } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';

import { Channel } from './constants';
import { ClientSettings } from './settings/types/ClientSettings';
import { formatDuration } from './util';
import { sendToChannelID } from './util/webhook';

export function isDoubleLootActive(client: KlasaClient, duration: number = 0) {
	return Date.now() - duration < client.settings.get(ClientSettings.DoubleLootFinishTime);
}

export async function addToDoubleLootTimer(amount: number, reason: string) {
	let current = globalClient.settings.get(ClientSettings.DoubleLootFinishTime);
	if (current < Date.now()) {
		current = Date.now();
	}
	await globalClient.settings.update(ClientSettings.DoubleLootFinishTime, current + amount);
	sendToChannelID(Channel.BSOGeneral, {
		content: `<@&923768318442229792> 🎉 ${formatDuration(
			amount
		)} added to the Double Loot timer because: ${reason}. 🎉`
	});
}

export async function addPatronLootTime(_tier: number, user?: KlasaUser) {
	let map: Record<number, number> = {
		1: 3,
		2: 6,
		3: 15,
		4: 25,
		5: 60
	};
	const tier = _tier - 1;
	if (!map[tier]) return;
	let minutes = map[tier];
	let timeAdded = Math.floor(Time.Minute * minutes);
	addToDoubleLootTimer(timeAdded, `${user ?? 'Someone'} became a Tier ${tier} sponsor`);
}
