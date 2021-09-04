import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['botmention'] });
	}

	async run(arg: string, possible: Possible, message: KlasaMessage) {
		const member =
			message.guild && Argument.regex.userOrMember.test(arg)
				? await message.guild.members.fetch(Argument.regex.userOrMember.exec(arg)![1]).catch(() => null)
				: null;
		if (member) {
			await member.user.settings.sync();
			return member;
		}
		throw message.language.get('RESOLVER_INVALID_MEMBER', possible.name);
	}
}
