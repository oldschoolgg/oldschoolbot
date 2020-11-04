import { Argument, KlasaMessage, Possible } from 'klasa';

import { GuildSettings } from '../lib/settings/types/GuildSettings';

export default class extends Argument {
	async run(arg: string, _: Possible, msg: KlasaMessage) {
		const prefix = msg.guild ? msg.guild.settings.get(GuildSettings.Prefix) : '=';
		if (typeof arg === 'undefined') {
			if (!msg.author.settings.get('RSN')) await msg.author.settings.sync(true);
			const player = msg.author.settings.get('RSN');
			if (player) return player;
			throw `Please specify a username, or set one with \`${prefix}setrsn <username>\``;
		}

		// @ts-ignore
		if (this.constructor.regex.userOrMember.test(arg)) {
			const user = await this.client.users

				// @ts-ignore
				.fetch(this.constructor.regex.userOrMember.exec(arg)[1])
				.catch(() => null);

			const rsn = user && user.settings.get('RSN');
			if (rsn) return rsn;
			throw "That person doesn't have an RSN set.";
		}
		if (arg.length > 12) throw 'Invalid username. Please try again.';
		return arg.toLowerCase();
	}
}
