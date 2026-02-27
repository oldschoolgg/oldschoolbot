import type { IMember } from '@oldschoolgg/schemas';
import type { RNGProvider } from 'node-rng';

export async function mockRandomMember({
	userId,
	guildId
}: {
	userId: string;
	guildId: string;
	rng: RNGProvider;
}): Promise<IMember> {
	return {
		user_id: userId,
		guild_id: guildId,
		roles: [],
		permissions: []
	};
}
