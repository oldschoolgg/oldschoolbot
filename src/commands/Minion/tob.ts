import { MessageAttachment } from 'discord.js';
import { calcWhatPercent, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import fetch from 'node-fetch';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import { Emoji } from '../../lib/constants';
import {
	baseTOBUniques,
	calcTOBInput,
	calculateTOBDeaths,
	calculateTOBUserGearPercents,
	checkTOBTeam,
	checkTOBUser,
	createTOBTeam
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
			usage: '[gear|start|sim|graph]',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			description: 'Sends your minion to do the Theatre of Blood.',
			examples: ['+raid solo', '+raid mass'],
			subcommands: true
		});
	}

	async graph(msg: KlasaMessage) {
		const result = await this._graph(msg.author, 5, false);
		return msg.channel.send({ files: [result[0]] });
	}

	async _graph(user: KlasaUser, teamSize: number, hardMode: boolean) {
		let duration = [];
		for (let i = 0; i < 250; i++) {
			const t = await createTOBTeam({
				team: new Array(teamSize).fill(user),
				hardMode,
				kcOverride: [i, i],
				disableVariation: true
			});
			duration.push(t.duration);
		}
		duration = duration.map(i => i / Time.Minute);
		const options = {
			type: 'line',
			data: {
				labels: [...Array(duration.length).keys()].map(i => `${i + 1}`),
				datasets: [
					{
						label: 'Cumulative Death Chance',
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(255, 0, 0)',
						data: [],
						fill: false,
						yAxisID: 'left'
					},
					{
						label: 'Duration (Hours)',
						fill: false,
						backgroundColor: 'rgb(0, 0, 0)',
						borderColor: 'rgb(0, 0, 0)',
						data: duration,
						yAxisID: 'right'
					}
				]
			},
			options: {
				stacked: false,
				title: {
					display: true,
					text: ''
				},
				scales: {
					yAxes: [
						{
							id: 'right',
							type: 'linear',
							display: true,
							position: 'right'
						},
						{
							id: 'left',
							type: 'linear',
							display: true,
							position: 'left',
							gridLines: {
								drawOnChartArea: false
							}
						}
					]
				}
			}
		};

		const imageBuffer = await fetch(
			`https://quickchart.io/chart?bkg=${encodeURIComponent('#fff')}&c=${encodeURIComponent(
				JSON.stringify(options)
			)}`
		).then(result => result.buffer());

		let arr = [['Attempts'].concat(options.data.datasets.map(i => i.label))];
		for (let i = 1; i < options.data.datasets[0].data.length; i++) {
			arr[i] = [(i - 1).toString()];
			for (const dataset of options.data.datasets) {
				arr[i].push(dataset.data[i - 1].toString());
			}
		}

		const normalTable = table(arr);
		return [imageBuffer, new MessageAttachment(Buffer.from(normalTable), 'Fletchables.txt')];
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
		let its = 100_000;
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

		const magna = await this.client.fetchUser('157797566833098752');
		const benny = await this.client.fetchUser('507686806624534529');
		let anime = await this.client.fetchUser('363917147052834819');

		const users = [magna, benny, anime]; // (await msg.makePartyAwaiter(partyOptions)).filter(u => !u.minionIsBusy);

		const teamCheckFailure = await checkTOBTeam(users, isHardMode);
		if (teamCheckFailure) {
			return msg.channel.send(`Your mass failed to start because of this reason: ${teamCheckFailure}`);
		}

		const { duration, totalReduction, reductions } = await createTOBTeam({ team: users, hardMode: isHardMode });

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
		const deathChances = calculateTOBDeaths(kc, hardKC, false);

		return msg.channel.send(`**Theatre of Blood**
KC: ${kc}
Hard KC: ${hardKC}
Death Chances: ${deathChances.deathChances.map(i => `${i.name}[${i.deathChance}%]`).join(' ')}`);
	}
}
