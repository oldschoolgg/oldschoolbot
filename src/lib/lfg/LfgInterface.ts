import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../constants';
import { KillableMonster } from '../minions/types';
import { ItemBank } from '../types';
import { ActivityTaskOptions } from '../types/minions';

export interface LfgStats {
	queueID: number;
	users: number;
	timesUsed: number;
	thingsKilledDone: number;
	lootObtained: ItemBank;
}

export interface LfgGetItemToRemoveFromBank {
	solo: boolean;
	party: KlasaUser[];
	client: KlasaClient;
	quantity: number;
	queue: LfgQueueProperties;
}

export interface LfgHandleTripFinish {
	data: ActivityTaskOptions;
	client: KlasaClient;
	queue: LfgQueueProperties;
}

export interface LfgHandleTripFinishReturn {
	usersWithLoot: lfgReturnMessageInterface[];
	usersWithoutLoot?: string[];
	extraMessage?: string | string[];
}

export interface LfgCalculateDurationAndActivitiesPerTrip {
	leader: KlasaUser;
	party: KlasaUser[];
	queue: LfgQueueProperties;
	quantity?: number;
}

export interface LfgCalculateDurationAndActivitiesPerTripReturn {
	activitiesThisTrip: number;
	durationOfTrip: number;
	timePerActivity?: number;
	extraMessages?: string[];
	extras?: Record<string, any>;
}

export interface LfgCheckUserRequirements {
	solo: boolean;
	user: KlasaUser;
	party: KlasaUser[];
	queue: LfgQueueProperties;
	quantity: number;
}

export interface LfgCheckTeamRequirements {
	solo?: boolean;
	party?: KlasaUser[];
	queue?: LfgQueueProperties;
	quantity?: number;
}

export interface LfgUserSentFrom {
	guild: string | undefined;
	channel: string;
}

export interface LfgQueueState {
	locked: boolean;
	users: Record<string, KlasaUser>;
	userSentFrom: Record<string, LfgUserSentFrom>;
	firstUserJoinDate?: Date;
	lastUserJoinDate?: Date;
	startDate?: Date;
	queueBase: LfgQueueProperties;
	soloStart: boolean;
	forceStart?: boolean;
}

export interface LfgQueueProperties {
	uniqueID: number;
	name: string;
	aliases: string[];
	lfgClass: LfgInterface;
	extraParams?: Record<string, any>;
	thumbnail: string;
	monster?: KillableMonster;
	minQueueSize: number;
	maxQueueSize: number;
	allowSolo: boolean;
	allowPrivate: boolean;
	creator?: KlasaUser;
	privateUniqueID?: number;
	cooldown?: number;
}

export interface lfgReturnMessageInterface {
	user: KlasaUser;
	emoji: Emoji | false;
	lootedItems: Bank | string;
	spoiler?: boolean;
}

export default interface LfgInterface {
	activity: ActivityTaskOptions;
	HandleTripFinish(params: LfgHandleTripFinish): Promise<LfgHandleTripFinishReturn>;
	calculateDurationAndActivitiesPerTrip(
		params: LfgCalculateDurationAndActivitiesPerTrip
	): Promise<LfgCalculateDurationAndActivitiesPerTripReturn>;
	checkUserRequirements(params: LfgCheckUserRequirements): Promise<string[]>;
	getItemToRemoveFromBank(params: LfgGetItemToRemoveFromBank): void;
	checkTeamRequirements(params: LfgCheckTeamRequirements): string[];
}
