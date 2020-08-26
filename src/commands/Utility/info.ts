import { Command, KlasaMessage } from 'klasa';

export default class extends Command {
	async run(msg: KlasaMessage) {
		return msg.send(`Old School Bot is an open-source Discord Bot based on Old School RuneScape.

	- Website: https://www.oldschool.gg/oldschoolbot/

	- Bot Invite Link: <https://invite.oldschool.gg/>

	- If you have any other enquiries, join the support server!

	- Support Server: discord.gg/ob`);
	}
}
