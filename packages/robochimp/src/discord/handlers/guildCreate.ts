import type { GatewayGuildCreateDispatchData } from '@oldschoolgg/discord';

export function onRawGuildCreate(g: GatewayGuildCreateDispatchData) {
	console.log(`Joined guild: ${g.name} (ID: ${g.id})`);
}
