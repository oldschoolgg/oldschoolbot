import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, {
			name: '...TradeableBank',
			aliases: ['...TradeableBank']
		});
	}

	async run(arg: string, possible: Possible, message: KlasaMessage): Promise<any> {
		if (!arg) return this.store.get('TradeableBank')!.run(arg, possible, message);

		const {
			args,
			usage: { usageDelim }
		} = message['prompter']!;

		const index = args.indexOf(arg);
		const rest = args.splice(index, args.length - index).join(usageDelim ?? '');
		return this.store.get('TradeableBank')!.run(rest, possible, message);
	}
}
