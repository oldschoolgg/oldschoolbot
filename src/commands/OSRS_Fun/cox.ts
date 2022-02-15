import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank, Util } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { chambersOfXericCL } from '../../lib/data/CollectionsExport';
import { BotCommand } from '../../lib/structures/BotCommand';
import { addBanks } from '../../lib/util';

const itemsToShow = chambersOfXericCL;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<amount:int{1,30}> [points:int{1,100000}] [names:...str]',
			usageDelim: ' ',
			requiredPermissionsForBot: ['EMBED_LINKS'],
			description: 'Simulates a Cox raid.',
			examples: ['+cox 30 30k', '+cox 5 30k Magnaboy, Woox'],
			categoryFlags: ['fun', 'simulation']
		});
	}

	determineLimit(user: KlasaUser) {
		if (this.client.owners.has(user)) {
			return Infinity;
		}

		return 5;
	}

	async run(msg: KlasaMessage, [amount, points = 30_000, names]: [number, number, string]) {
		const limit = this.determineLimit(msg.author);

		if (!names) {
			const team = [
				{
					id: msg.author.id,
					personalPoints: points
				}
			];

			let loot = new Bank();
			for (let i = 0; i < amount; i++) {
				const singleRaidLoot = ChambersOfXeric.complete({
					team,
					challengeMode: Boolean(msg.flagArgs.cm),
					timeToComplete: 1
				});

				for (const lootBank of Object.values(singleRaidLoot)) {
					loot.add(lootBank);
				}
			}

			return msg.channel.sendBankImage({
				bank: loot,
				title: `Loot from ${amount} solo raids with ${Util.toKMB(points)} points.`
			});
		}

		if (amount > limit) {
			return (
				`The quantity you gave exceeds your limit of ${limit.toLocaleString()}! ` +
				'*You can increase your limit by becoming a patron at <https://www.patreon.com/oldschoolbot>.'
			);
		}

		const arrayOfNames = names.split(' ');

		if (arrayOfNames.length > 5) return msg.channel.send("You can't have more than 5 members in a raid team.");

		const team = arrayOfNames.map(member => ({
			id: member,
			personalPoints: points
		}));

		const loot: {
			[key: string]: ItemBank;
		} = {};
		for (let i = 0; i < amount; i++) {
			const singleRaidLoot = ChambersOfXeric.complete({
				team,
				challengeMode: Boolean(msg.flagArgs.cm),
				timeToComplete: 1
			});

			for (const [memberID, lootBank] of Object.entries(singleRaidLoot)) {
				loot[memberID] = addBanks([loot[memberID] || {}, lootBank]);
			}
		}

		let result = `In a group raid with ${team.length} users with ${Util.toKMB(points)} points each...\n`;
		for (const [memberID, lootBank] of Object.entries(loot)) {
			result += `**${memberID}** received: ${new Bank(lootBank).filter(
				item => itemsToShow.includes(item.id),
				false
			)}\n`;
		}

		return msg.channel.send(result);
	}
}
