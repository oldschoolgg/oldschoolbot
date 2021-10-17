import { notEmpty, sleep } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { getHalloweenPeople, halloweenPeople, keys } from '../lib/halloweenEvent';
import { minionNotBusy, requiresMinion } from '../lib/minions/decorators';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { BotCommand } from '../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[accuse] [names:...str]',
			usageDelim: ' ',
			description: 'The 2021 Halloween event.',
			examples: ['+hweenevent', '+hweenevent accuse bob, jim'],
			categoryFlags: ['minion'],
			subcommands: true
		});
	}

	getNum(user: KlasaUser) {
		let wrongAccs = user.settings.get(UserSettings.WrongAccusations);
		let mod = wrongAccs === 0 ? 0 : wrongAccs * 33_399;
		return Number(user.id) + mod;
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const halloweenData = getHalloweenPeople(this.getNum(msg.author));
		const { victim, suspects, murderers, witnessedAsInnocent } = halloweenData;
		console.log(`Murderers for ${msg.author.username} are: ${murderers.map(m => m.person.name)}`);

		return msg.channel.send(
			`Can you solve the Murder Mystery? Two suspects worked together, to murder the host of the party, ${
				victim.person.name
			}, while they were in their special ${
				victim.roomColor.name
			} room, everyone claims that they were sleeping in their own rooms when it happened, the guard was with ${witnessedAsInnocent
				.map(i => i.person.name)
				.join(
					' and '
				)} when it happened. The guard has given you keys to access all the rooms to complete your investigation (${keys
				.map(i => i.item.name)
				.join(', ')}).

**Suspects:** ${suspects.map(sus => `${sus.person.name} (${sus.roomColor.name} room)`).join(', ')}
**Victim:** ${victim.person.name} was ${victim.person.word} in ${victim.person.gender === 'male' ? 'his' : 'her'} ${
				victim.roomColor.name
			} room.

When you've figured out who the murderers are, do \`${msg.cmdPrefix}hweenevent accuse name1, name2\``
		);
	}

	async accuse(msg: KlasaMessage, [accused = '']: [string]) {
		if (msg.author.cl().has('Banshee mask')) {
			return msg.channel.send('You have already found the killers!');
		}
		const halloweenData = getHalloweenPeople(this.getNum(msg.author));
		const accusedPeople = accused
			.split(',')
			.map(i => i.trim())
			.map(i => halloweenPeople.find(t => t.name.toLowerCase() === i.toLowerCase()))
			.filter(notEmpty);

		if (!accusedPeople || accusedPeople.length !== 2) {
			return msg.channel.send("You didn't specify which people you wan't to accuse.");
		}
		if (accusedPeople.some(p => p === halloweenData.victim.person)) {
			return msg.channel.send("You're pretty sure the victim didn't commit suicide...");
		}
		if (accusedPeople[0] === accusedPeople[1]) {
			return msg.channel.send("You can't accuse the same person twice...");
		}

		await msg.confirm(
			`Are you sure you want to accuse ${accusedPeople[0].name} and ${accusedPeople[1].name} of being the murderers?`
		);
		await msg.channel.send(
			`You tell the Guard, that ${accusedPeople[0].name} and ${accusedPeople[1].name} are the murderers....`
		);
		await sleep(2300);
		if (halloweenData.murderers.every(i => accusedPeople.includes(i.person))) {
			const loot = new Bank().add('Banshee mask').add('Banshee top').add('Banshee robe').add('Hunting knife');
			await msg.author.addItemsToBank(loot, true);
			return msg.channel
				.send(`You caught the killers! As a reward, the guard has given you the killers' outfit and murder weapon! Don't lose them, you can't get them back!
			
You received: ${loot}.`);
		}

		await msg.author.settings.update(
			UserSettings.WrongAccusations,
			msg.author.settings.get(UserSettings.WrongAccusations) + 1
		);
		return msg.channel.send(
			"You accused the wrong people! You've created a divergence in the RuneScape timeline, the gods have turned back time to give you another chance, don't mess it up this time!"
		);
	}
}
