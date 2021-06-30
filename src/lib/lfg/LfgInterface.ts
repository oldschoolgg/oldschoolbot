import { KlasaClient, KlasaUser } from 'klasa';

import { QueueProperties } from '../../commands/Minion/lfg';
import { ActivityTaskOptions } from '../types/minions';
import { lfgReturnMessageInterface } from './LfgUtils';

export interface LfgGetItemToRemoveFromBank {
	solo: boolean;
	party: KlasaUser[];
	client: KlasaClient;
	quantity: number;
	queue: QueueProperties;
}

export interface LfgHandleTripFinish {
	data: ActivityTaskOptions;
	client: KlasaClient;
	queue: QueueProperties;
}

export interface LfgCalculateDurationAndActivitiesPerTrip {
	party: KlasaUser[];
	queue: QueueProperties;
	quantity?: number;
}

export interface LfgCheckUserRequirements {
	solo: boolean;
	user: KlasaUser;
	party: KlasaUser[];
	queue: QueueProperties;
	quantity: number;
}

export interface LfgCheckTeamRequirements {
	solo?: boolean;
	party?: KlasaUser[];
	queue?: QueueProperties;
	quantity?: number;
}

export default interface LfgInterface {
	activity: ActivityTaskOptions;
	HandleTripFinish(params: LfgHandleTripFinish): Promise<[lfgReturnMessageInterface[], string[], string]>;
	calculateDurationAndActivitiesPerTrip(
		params: LfgCalculateDurationAndActivitiesPerTrip
	): Promise<[number, number, number, string[]]>;
	checkUserRequirements(params: LfgCheckUserRequirements): Promise<string[]>;
	getItemToRemoveFromBank(params: LfgGetItemToRemoveFromBank): void;
	checkTeamRequirements(params: LfgCheckTeamRequirements): string[];
}
