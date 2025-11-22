import type { RNGProvider } from '@oldschoolgg/rng';
import type { IMember } from '@oldschoolgg/schemas';

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
