import type { TextChannel } from 'discord.js';

import { globalConfig } from './constants';
import { formatDuration } from './util';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from './util/clientSettings';

export let DOUBLE_LOOT_FINISH_TIME_CACHE = 0;

export function isDoubleLootActive(duration = 0) {
	return Date.now() - duration < DOUBLE_LOOT_FINISH_TIME_CACHE;
}

export async function addToDoubleLootTimer(amount: number, reason: string) {
	const clientSettings = await mahojiClientSettingsFetch();
	let current = Number(clientSettings.double_loot_finish_time);
	if (current < Date.now()) {
		current = Date.now();
	}
	const newDoubleLootTimer = current + amount;
	await mahojiClientSettingsUpdate({
		double_loot_finish_time: newDoubleLootTimer
	});
	DOUBLE_LOOT_FINISH_TIME_CACHE = newDoubleLootTimer;
	(globalClient.channels.cache.get(globalConfig.generalChannelID)! as TextChannel).send({
		content: `<@&923768318442229792> 🎉 ${formatDuration(
			amount
		)} added to the Double Loot timer because: ${reason}. 🎉`,
		allowedMentions: { roles: ['923768318442229792'] }
	});

	syncPrescence();
}

export async function syncDoubleLoot() {
	const clientSettings = await mahojiClientSettingsFetch();
	DOUBLE_LOOT_FINISH_TIME_CACHE = Number(clientSettings.double_loot_finish_time);
}

export async function syncPrescence() {
	await syncDoubleLoot();

	const str = isDoubleLootActive()
		? `${formatDuration(DOUBLE_LOOT_FINISH_TIME_CACHE - Date.now(), true)} Double Loot!`
		: '/help';
	if (globalClient.user!.presence.activities[0]?.name !== str) {
		globalClient.user?.setActivity(str);
	}
}
