import { activity_type_enum } from '@prisma/client';

import { championsChallengeCommand } from './championsChallenge';
import { combatRingCommand } from './combatRingCommand';
import { strongHoldOfSecurityCommand } from './strongHoldOfSecurityCommand';

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

export function otherActivitiesCommand(type: string, user: MUser, channelID: string) {
	if (type === 'ChampionsChallenge') {
		return championsChallengeCommand(user, channelID);
	}
	if (type === 'StrongholdOfSecurity') {
		return strongHoldOfSecurityCommand(user, channelID);
	}
	if (type === 'CombatRing') {
		return combatRingCommand(user, channelID);
	}
	return 'Invalid activity type.';
}
