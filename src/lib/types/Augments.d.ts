import { FSWatcher } from 'chokidar';
import { MessageOptions, MessagePayload } from 'discord.js';
import { KlasaMessage, KlasaUser, Settings } from 'klasa';
import { Image } from 'skia-canvas/lib';

import { BitField } from '../constants';
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

	interface Command {
		altProtection?: boolean;
		guildOnly?: boolean;
		perkTier?: number;
		ironCantUse?: boolean;
		testingCommand?: boolean;
		bitfieldsRequired?: BitField[];
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
export type KlasaSend = (input: string | MessagePayload | MessageOptions) => Promise<KlasaMessage>;

declare module 'discord.js' {
	interface TextBasedChannel {
		send: KlasaSend;
	}
	interface TextChannel {
		send: KlasaSend;
	}
	interface DMChannel {
		send: KlasaSend;
	}
	interface ThreadChannel {
		send: KlasaSend;
	}
	interface NewsChannel {
		send: KlasaSend;
	}
	interface PartialTextBasedChannelFields {
		send: KlasaSend;
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
	}
}
