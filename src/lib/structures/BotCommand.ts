import { PermissionResolvable } from 'discord.js';
import { Command, CommandOptions, CommandStore, KlasaMessage, util } from 'klasa';

import { BitField } from '../constants';
import { CategoryFlag } from '../types';

export abstract class BotCommand extends Command {
	public altProtection: boolean;
	public guildOnly: boolean;
	public oneAtTime: boolean;
	public perkTier?: number;
	public ironCantUse?: boolean;
	public examples: string[];
	public categoryFlags: CategoryFlag[];
	public restrictedChannels: string[];
	public cooldown?: number;
	public requiredPermissionsForBot: PermissionResolvable[];
	public requiredPermissionsForUser: PermissionResolvable[];

	public constructor(store: CommandStore, file: string[], directory: string, options: BotCommandOptions = {}) {
		super(
			store,
			file,
			directory,
			util.mergeDefault(
				{
					altProtection: false,
					oneAtTime: false,
					guildOnly: false,
					ironCantUse: false,
					restrictedChannels: []
				},
				options
			)
		);
		this.altProtection = options.altProtection!;
		this.oneAtTime = options.oneAtTime!;
		this.guildOnly = options.guildOnly!;
		this.perkTier = options.perkTier;
		this.ironCantUse = options.ironCantUse;
		this.examples = options.examples || [];
		this.categoryFlags = options.categoryFlags || [];
		this.bitfieldsRequired = options.bitfieldsRequired || [];
		this.restrictedChannels = options.restrictedChannels || [];
		this.cooldown = options.cooldown;
		this.requiredPermissionsForBot = options.requiredPermissionsForBot || [];
		this.requiredPermissionsForUser = options.requiredPermissionsForUser || [];
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public run(message: KlasaMessage, _params: any[]): any {
		return message;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: KlasaMessage): Promise<boolean> | boolean {
		return false;
	}
}

export interface BotCommandOptions extends CommandOptions {
	altProtection?: boolean;
	oneAtTime?: boolean;
	guildOnly?: boolean;
	perkTier?: number;
	ironCantUse?: boolean;
	testingCommand?: boolean;
	examples?: string[];
	description?: string;
	categoryFlags?: CategoryFlag[];
	bitfieldsRequired?: BitField[];
	restrictedChannels?: string[];
	cooldown?: number;
	requiredPermissionsForBot?: PermissionResolvable[];
	requiredPermissionsForUser?: PermissionResolvable[];
}
