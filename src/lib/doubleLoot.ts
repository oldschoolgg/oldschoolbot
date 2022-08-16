import { Time } from 'e';
import { KlasaUser } from 'klasa';

import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../mahoji/mahojiSettings';
import { syncPrescence } from '../tasks/presence';
import { Channel } from './constants';
import { formatDuration } from './util';
import { sendToChannelID } from './util/webhook';

export let DOUBLE_LOOT_FINISH_TIME_CACHE = 0;

export function isDoubleLootActive(duration: number = 0) {
	return Date.now() - duration < DOUBLE_LOOT_FINISH_TIME_CACHE;
}

export async function addToDoubleLootTimer(amount: number, reason: string) {
	const clientSettings = await mahojiClientSettingsFetch({
		double_loot_finish_time: true
	});
	let current = Number(clientSettings.double_loot_finish_time);
	if (current < Date.now()) {
		current = Date.now();
	}
	const newDoubleLootTimer = current + amount;
	await mahojiClientSettingsUpdate({
		double_loot_finish_time: newDoubleLootTimer
	});
	DOUBLE_LOOT_FINISH_TIME_CACHE = newDoubleLootTimer;
	sendToChannelID(Channel.BSOGeneral, {
		content: `<@&923768318442229792> 🎉 ${formatDuration(
			amount
		)} added to the Double Loot timer because: ${reason}. 🎉`
	});
	syncPrescence();
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

export async function syncDoubleLoot() {
	const clientSettings = await mahojiClientSettingsFetch({
		double_loot_finish_time: true
	});
	DOUBLE_LOOT_FINISH_TIME_CACHE = Number(clientSettings.double_loot_finish_time);
}
