import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['botmention'] });
	}

	async run(arg: string, possible: Possible, message: KlasaMessage) {
		const user = Argument.regex.userOrMember.test(arg)
			? await this.client.users.fetch(Argument.regex.userOrMember.exec(arg)![1]).catch(() => null)
			: null;
		if (user) {
			await user.settings.sync();
			return user;
		}
		throw message.language.get('RESOLVER_INVALID_USER', possible.name);
	}
}
