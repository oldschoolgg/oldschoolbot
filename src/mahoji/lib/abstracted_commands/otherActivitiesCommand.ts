import { activity_type_enum } from '@/prisma/main/enums.js';
import { championsChallengeCommand } from '@/mahoji/lib/abstracted_commands/championsChallenge.js';
import { combatRingCommand } from '@/mahoji/lib/abstracted_commands/combatRingCommand.js';
import { mageArena2Command } from '@/mahoji/lib/abstracted_commands/mageArena2Command.js';
import { mageArenaCommand } from '@/mahoji/lib/abstracted_commands/mageArenaCommand.js';
import { huntCrashedStarsCommand } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';
import { strongHoldOfSecurityCommand } from '@/mahoji/lib/abstracted_commands/strongHoldOfSecurityCommand.js';

export const otherActivities = [
	{
		name: 'Mage Arena I',
		type: activity_type_enum.MageArena
	},
	{
		name: 'Mage Arena II',
		type: activity_type_enum.MageArena2
	},
	{
		name: 'Champions Challenge',
		type: activity_type_enum.ChampionsChallenge
	},
	{
		name: 'Stronghold of Security',
		type: activity_type_enum.StrongholdOfSecurity
	},
	{
		name: 'Combat Ring (Shayzien)',
		type: activity_type_enum.CombatRing
	},
	{
		name: 'Hunt Crashed Stars',
		type: activity_type_enum.ShootingStars
	}
];

export function otherActivitiesCommand({
	interaction,
	type,
	user,
	channelId,
	rng
}: {
	interaction: OSInteraction;
	type: string;
	user: MUser;
	channelId: string;
	rng: RNGProvider;
}) {
	if (type === 'MageArena') {
		return mageArenaCommand(rng, user, channelId);
	}
	if (type === 'MageArena2') {
		return mageArena2Command(rng, user, channelId);
	}
	if (type === 'ChampionsChallenge') {
		return championsChallengeCommand(interaction);
	}
	if (type === 'StrongholdOfSecurity') {
		return strongHoldOfSecurityCommand(interaction);
	}
	if (type === 'CombatRing') {
		return combatRingCommand(interaction);
	}
	if (type === 'ShootingStars') {
		return huntCrashedStarsCommand({ rng, channelId, user });
	}
	return 'Invalid activity type.';
}
