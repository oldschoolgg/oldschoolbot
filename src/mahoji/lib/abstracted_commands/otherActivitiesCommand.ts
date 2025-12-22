import { activity_type_enum } from '@/prisma/main/enums.js';
import { championsChallengeCommand } from '@/mahoji/lib/abstracted_commands/championsChallenge.js';
import { combatRingCommand } from '@/mahoji/lib/abstracted_commands/combatRingCommand.js';
import { strongHoldOfSecurityCommand } from '@/mahoji/lib/abstracted_commands/strongHoldOfSecurityCommand.js';

export const otherActivities = [
	{
		name: 'Champions Challenge',
		command: championsChallengeCommand,
		type: activity_type_enum.ChampionsChallenge
	},
	{
		name: 'Stronghold of Security',
		command: championsChallengeCommand,
		type: activity_type_enum.StrongholdOfSecurity
	},
	{
		name: 'Combat Ring (Shayzien)',
		command: combatRingCommand,
		type: activity_type_enum.CombatRing
	}
];

export function otherActivitiesCommand(type: string, user: MUser, channelId: string) {
	if (type === 'ChampionsChallenge') {
		return championsChallengeCommand(user, channelId);
	}
	if (type === 'StrongholdOfSecurity') {
		return strongHoldOfSecurityCommand(user, channelId);
	}
	if (type === 'CombatRing') {
		return combatRingCommand(user, channelId);
	}
	return 'Invalid activity type.';
}
