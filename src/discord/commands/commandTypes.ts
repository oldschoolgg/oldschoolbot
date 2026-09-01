import type { PermissionKey, SpecialResponse } from '@oldschoolgg/discord';
import type { IMember } from '@oldschoolgg/schemas';

import type { AnyArr, AsOptArr, ExtractOptions } from '@/discord/index.js';

export type CategoryFlag =
	| 'minion'
	| 'settings'
	| 'patron'
	| 'skilling'
	| 'pvm'
	| 'minigame'
	| 'utility'
	| 'fun'
	| 'simulation';

export interface AbstractCommandAttributes {
	examples?: string[];
	categoryFlags?: CategoryFlag[];
	enabled?: boolean;
	requiresMinionNotBusy?: boolean;
	requiresMinion?: boolean;
	description: string;
}

export function defineCommand<const T extends AnyArr<unknown>>(
	cmd: Readonly<{
		name: string;
		flags?: CommandFlag[];
		attributes?: Omit<AbstractCommandAttributes, 'description'>;
		description: string;
		options: T;
		requiredPermissions?: PermissionKey[];
		guildId?: string;
		run(options: CommandRunOptions<ExtractOptions<T>>): CommandResponse;
	}> &
		(T[number] extends CommandOption ? unknown : { __error__: 'options must be CommandOption[]' })
): OSBMahojiCommand<AsOptArr<T>> {
	return cmd as unknown as OSBMahojiCommand<AsOptArr<T>>;
}

export type CommandResponse = Promise<CommandResponseValue>;

export type CommandResponseValue = SendableMessage | SpecialResponse;

type OSBMahojiCommand<T extends readonly CommandOption[] = CommandOption[]> = Readonly<{
	name: string;
	attributes?: Omit<AbstractCommandAttributes, 'description'>;
	description: string;
	options: T;
	requiredPermissions?: PermissionKey[];
	guildId?: string;
	run(options: CommandRunOptions<ExtractOptions<T>>): CommandResponse;
}>;

export type CommandRunOptions<TOpts = {}> = {
	interaction: OSInteraction;
	options: TOpts;
	user: MUser;
	member: IMember | null;
	channelId: string;
	guildId: string | null;
	userId: string;
	rng: RNGProvider;
};

type CommandFlag = 'REQUIRES_LOCK';

export type AnyCommand = Readonly<{
	name: string;
	flags?: CommandFlag[];
	attributes?: Omit<AbstractCommandAttributes, 'description'>;
	description: string;
	options: readonly CommandOption[];
	requiredPermissions?: PermissionKey[];
	guildId?: string;
	run(options: CommandRunOptions): CommandResponse;
}>;
