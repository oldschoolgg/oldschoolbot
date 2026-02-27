import { activity_type_enum } from '@/prisma/main/enums.js';
import { championsChallengeCommand } from '@/mahoji/lib/abstracted_commands/championsChallenge.js';
import { combatRingCommand } from '@/mahoji/lib/abstracted_commands/combatRingCommand.js';
import { strongHoldOfSecurityCommand } from '@/mahoji/lib/abstracted_commands/strongHoldOfSecurityCommand.js';

export const otherActivities = [
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
	}
];

export function otherActivitiesCommand(itx: OSInteraction, type: string) {
	if (type === 'ChampionsChallenge') {
		return championsChallengeCommand(itx);
	}
	if (type === 'StrongholdOfSecurity') {
		return strongHoldOfSecurityCommand(itx);
	}
	if (type === 'CombatRing') {
		return combatRingCommand(itx);
	}
	return 'Invalid activity type.';
}
