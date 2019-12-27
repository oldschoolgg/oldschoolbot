import { Command, CommandOptions, CommandStore, KlasaMessage, util, KlasaClient } from 'klasa';

export abstract class BotCommand extends Command {
	public altProtection: boolean;

	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string,
		options: BotCommandOptions = {}
	) {
		super(client, store, file, directory, util.mergeDefault({ altProtection: false }, options));
		this.altProtection = options.altProtection!;
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
}
