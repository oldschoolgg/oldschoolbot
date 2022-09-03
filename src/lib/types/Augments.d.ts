import { FSWatcher } from 'chokidar';
import { KlasaUser, Settings } from 'klasa';
import { Image } from 'skia-canvas/lib';

import { CustomGet } from '../settings/types/UserSettings';

declare module 'klasa' {
	interface KlasaClient {
		oneCommandAtATimeCache: Set<string>;
		secondaryUserBusyCache: Set<string>;
		settings: Settings;
		production: boolean;
		_fileChangeWatcher?: FSWatcher;
		_badgeCache: Map<string, string>;
		_peakIntervalCache: Peak[];
		fastifyServer: FastifyInstance;
		minionTicker: NodeJS.Timeout;
		dailyReminderTicker: NodeJS.Timeout;
		giveawayTicker: NodeJS.Timeout;
		analyticsInterval: NodeJS.Timeout;
		metricsInterval: NodeJS.Timeout;
		options: KlasaClientOptions;
		fetchUser(id: string | bigint): Promise<KlasaUser>;
	}

	interface Task {
		getItemImage(itemID: number, quantity: number): Promise<Image>;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
	}
}

declare module 'discord.js/node_modules/discord-api-types/v8' {
	type Snowflake = string;
}
