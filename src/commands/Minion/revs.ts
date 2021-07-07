import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { KillableMonster } from '../../lib/minions/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { RevenantOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, randomVariation, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export const revenantMonsters: KillableMonster[] = [
	{
		id: Monsters.RevenantCyclops.id,
		name: Monsters.RevenantCyclops.name,
		aliases: Monsters.RevenantCyclops.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.RevenantCyclops,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDarkBeast.id,
		name: Monsters.RevenantDarkBeast.name,
		aliases: Monsters.RevenantDarkBeast.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.RevenantDarkBeast,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDemon.id,
		name: Monsters.RevenantDemon.name,
		aliases: Monsters.RevenantDemon.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.RevenantDemon,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantDragon.id,
		name: Monsters.RevenantDragon.name,
		aliases: Monsters.RevenantDragon.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.RevenantDragon,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantGoblin.id,
		name: Monsters.RevenantGoblin.name,
		aliases: Monsters.RevenantGoblin.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.RevenantGoblin,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantHellhound.id,
		name: Monsters.RevenantHellhound.name,
		aliases: Monsters.RevenantHellhound.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.RevenantHellhound,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantHobgoblin.id,
		name: Monsters.RevenantHobgoblin.name,
		aliases: Monsters.RevenantHobgoblin.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.RevenantHobgoblin,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantImp.id,
		name: Monsters.RevenantImp.name,
		aliases: Monsters.RevenantImp.aliases,
		timeToFinish: Time.Second * 10,
		table: Monsters.RevenantImp,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantKnight.id,
		name: Monsters.RevenantKnight.name,
		aliases: Monsters.RevenantKnight.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.RevenantKnight,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantOrk.id,
		name: Monsters.RevenantOrk.name,
		aliases: Monsters.RevenantOrk.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.RevenantOrk,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	},
	{
		id: Monsters.RevenantPyrefiend.id,
		name: Monsters.RevenantPyrefiend.name,
		aliases: Monsters.RevenantPyrefiend.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.RevenantPyrefiend,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0
	}
];
export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to kill monsters.'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		const boosts = [];

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const monster = revenantMonsters.find(m => stringMatches(m.name, name));
		if (!monster) {
			return msg.channel.send(
				`That's not a valid revenant. The valid revenants are: ${revenantMonsters.map(m => m.name).join(', ')}.`
			);
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength() / monster.timeToFinish);
		}

		let duration = monster.timeToFinish * quantity;
		duration = randomVariation(duration, 3);

		if (isWeekend()) {
			boosts.push('10% for Weekend');
			duration *= 0.9;
		}

		const cost = new Bank();
		updateBankSetting(this.client, ClientSettings.EconomyStats.PVMCost, cost);
		await msg.author.removeItemsFromBank(cost);

		await addSubTaskToActivityTask<RevenantOptions>({
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Revenants
		});
		let response = `${msg.author.minionName} is now killing ${quantity}x ${
			monster.name
		}, it'll take around ${formatDuration(duration)} to finish. `;

		return msg.channel.send(response);
	}
}
