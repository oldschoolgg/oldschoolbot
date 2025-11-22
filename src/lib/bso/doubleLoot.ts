import { roleMention } from '@oldschoolgg/discord';
import { formatDuration, Time } from '@oldschoolgg/toolkit';

import { Channel, Roles } from '@/lib/constants.js';

export let DOUBLE_LOOT_FINISH_TIME_CACHE = 0;

export function isDoubleLootActive(duration = 0) {
	return Date.now() - duration < DOUBLE_LOOT_FINISH_TIME_CACHE;
}

export async function addToDoubleLootTimer(amount: number, reason: string) {
	const clientSettings = await ClientSettings.fetch({
		double_loot_finish_time: true
	});
	let current = Number(clientSettings.double_loot_finish_time);
	if (current < Date.now()) {
		current = Date.now();
	}
	const newDoubleLootTimer = current + amount;
	await ClientSettings.update({
		double_loot_finish_time: newDoubleLootTimer
	});
	DOUBLE_LOOT_FINISH_TIME_CACHE = newDoubleLootTimer;

	await globalClient.sendMessage(Channel.GeneralChannel, {
		content: `${roleMention(Roles.BSODoubleLoot)} 🎉 ${formatDuration(
			amount
		)} added to the Double Loot timer because: ${reason}. 🎉`,
		allowedMentions: { roles: [Roles.BSODoubleLoot] }
	});

	await syncPrescence();
}

export async function addPatronLootTime(_tier: number, user: MUser | null) {
	const map: Record<number, number> = {
		1: 3,
		2: 6,
		3: 15,
		4: 25,
		5: 60
	};
	const tier = _tier - 1;
	if (!map[tier]) return;
	const minutes = map[tier];
	const timeAdded = Math.floor(Time.Minute * minutes);
	await addToDoubleLootTimer(timeAdded, `${user ?? 'Someone'} became a Tier ${tier} sponsor`);
}

export async function syncDoubleLoot() {
	const clientSettings = await ClientSettings.fetch({
		double_loot_finish_time: true
	});
	DOUBLE_LOOT_FINISH_TIME_CACHE = Number(clientSettings.double_loot_finish_time);
}

export async function syncPrescence() {
	await syncDoubleLoot();

	const str = isDoubleLootActive()
		? `${formatDuration(DOUBLE_LOOT_FINISH_TIME_CACHE - Date.now(), true)} Double Loot!`
		: '/help';
	await globalClient.setPresence({
		text: str
	});
}
