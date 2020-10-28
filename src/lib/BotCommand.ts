import { Command, CommandOptions, CommandStore, KlasaMessage, util } from 'klasa';

export abstract class BotCommand extends Command {
	public altProtection: boolean;
	public guildOnly: boolean;
	public oneAtTime: boolean;
	public perkTier?: number;
	public ironCantUse?: boolean;
	public examples: string[];

	public constructor(
		store: CommandStore,
		file: string[],
		directory: string,
		options: BotCommandOptions = {}
	) {
		super(
			store,
			file,
			directory,
			util.mergeDefault(
				{
					altProtection: false,
					oneAtTime: false,
					guildOnly: false,
					ironCantUse: false
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
}
