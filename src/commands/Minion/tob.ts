import { calcWhatPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import {
	baseTOBUniques,
	calcTOBDuration,
	calcTOBInput,
	calculateTOBUserGearPercents,
	checkTOBTeam,
	checkTOBUser
} from '../../lib/data/tob';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { TheatreOfBlood, TheatreOfBloodOptions } from '../../lib/simulation/tob';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { TheatreOfBloodTaskOptions } from '../../lib/types/minions';
import { calcDropRatesFromBank, formatDuration, toKMB, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[gear|start|sim]',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			description: 'Sends your minion to do the Theatre of Blood.',
			examples: ['+raid solo', '+raid mass'],
			subcommands: true
		});
	}

	async sim(msg: KlasaMessage) {
		const options: TheatreOfBloodOptions = {
			hardMode: false,
			team: [
				{ id: '1', deaths: [] },
				{ id: '2', deaths: [] },
				{ id: '3', deaths: [] },
				{ id: '4', deaths: [] }
			]
		};
		let its = 500_000;
		const totalLoot = new Bank();
		const userLoot = new Bank();
		for (let i = 0; i < its; i++) {
			const result = TheatreOfBlood.complete(options);
			for (const [id, b] of Object.entries(result.loot)) {
				totalLoot.add(b);
				if (id === '1') {
					userLoot.add(b);
				}
			}
		}

		return msg.channel.send(`Loot From ${its.toLocaleString()} TOB, Team of 4

**Team Loot:** ${toKMB(Math.round(totalLoot.value() / its))} avg \`\`\`${calcDropRatesFromBank(
			totalLoot,
			its,
			baseTOBUniques
		)}\`\`\`
**User Loot:** ${toKMB(Math.round(userLoot.value() / its))} avg \`\`\`${calcDropRatesFromBank(
			userLoot,
			its,
			baseTOBUniques
		)}\`\`\``);
	}

	async start(msg: KlasaMessage) {
		const isHardMode = Boolean(msg.flagArgs.hard);
		const initialCheck = await checkTOBUser(msg.author, isHardMode);
		if (initialCheck[0]) {
			return msg.channel.send(initialCheck[1]);
		}

		if (isHardMode) {
			const normalKC = await msg.author.getMinigameScore('tob');
			if (normalKC < 200) {
				return msg.channel.send(
					'You need atleast 200 completions of the Chambers of Xeric before you can attempt Challenge Mode.'
				);
			}
		}
		if (msg.author.minionIsBusy) {
			return msg.channel.send("Your minion is busy, so you can't start a raid.");
		}

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 1,
			maxSize: 5,
			ironmanAllowed: true,
			message: `${msg.author.username} is hosting a ${
				isHardMode ? '**Hard mode** ' : ''
			}Theatre of Blood mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: user => checkTOBUser(user, isHardMode)
		};

		const users = (await msg.makePartyAwaiter(partyOptions)).filter(u => !u.minionIsBusy);
		while (users.length < 4) {
			users.push(msg.author);
		}

		const teamCheckFailure = await checkTOBTeam(users, isHardMode);
		if (teamCheckFailure) {
			return msg.channel.send(`Your mass failed to start because of this reason: ${teamCheckFailure}`);
		}

		const { duration, totalReduction, reductions } = await calcTOBDuration(users, isHardMode);

		let debugStr = '';

		const totalCost = new Bank();

		await Promise.all(
			users.map(async u => {
				const supplies = await calcTOBInput(u);
				await u.removeItemsFromBank(supplies);
				totalCost.add(supplies);
				const { total } = calculateTOBUserGearPercents(u);
				debugStr += `${u.username} (${Emoji.Gear}${total.toFixed(1)}% ${Emoji.CombatSword} ${calcWhatPercent(
					reductions[u.id],
					totalReduction
				).toFixed(1)}%) used ${supplies}\n`;
			})
		);

		updateBankSetting(this.client, ClientSettings.EconomyStats.TOBCost, totalCost);

		await addSubTaskToActivityTask<TheatreOfBloodTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: 'TheatreOfBlood',
			leader: msg.author.id,
			users: users.map(u => u.id),
			hardMode: isHardMode
		});

		let str = `${partyOptions.leader.username}'s party (${users
			.map(u => u.username)
			.join(', ')}) is now off to do a Theatre of Blood raid - the total trip will take ${formatDuration(
			duration
		)}.`;

		str += ` \n\n${debugStr}`;

		return msg.channel.send(str);
	}

	async run(msg: KlasaMessage) {
		const hardKC = await msg.author.getMinigameScore('tob_hard');
		const kc = await msg.author.getMinigameScore('tob');

		return msg.channel.send(`**Theatre of Blood**
KC: ${kc}
Hard KC: ${hardKC}`);
	}
}
