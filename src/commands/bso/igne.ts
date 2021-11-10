import { MessageEmbed, TextChannel } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Emoji } from '../../lib/constants';
import { Ignecarus } from '../../lib/minions/data/killableMonsters/custom/Ignecarus';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BossInstance } from '../../lib/structures/Boss';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { formatDuration } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[qty:int]',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES']
		});
	}

	async run(msg: KlasaMessage, [qty]: [number]) {
		const instance = new BossInstance({
			leader: msg.author,
			id: Ignecarus.id,
			baseDuration: Time.Minute * 25,
			skillRequirements: {
				slayer: 110
			},
			itemBoosts: [
				['Ignis ring(i)', 10],
				['TzKal cape', 6]
			],
			customDenier: async () => {
				return [false];
			},
			bisGear: new Gear({
				head: 'Dwarven full helm',
				body: 'Dwarven platebody',
				legs: 'Dwarven platelegs',
				hands: 'Dwarven gloves',
				feet: 'Dwarven boots',
				cape: 'TzKal cape',
				ring: 'Ignis ring(i)',
				weapon: 'Drygore longsword',
				shield: 'Dragonfire shield',
				neck: "Brawler's hook necklace"
			}),
			gearSetup: 'melee',
			itemCost: async data => {
				const userBank = data.user.bank();
				const kc = data.user.getKC(Ignecarus.id);

				let brewsNeeded = Math.max(1, 8 - Math.max(1, Math.ceil((kc + 1) / 30))) + 1;
				const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));
				const heatResBank = new Bank()
					.add('Heat res. brew', brewsNeeded)
					.add('Heat res. restore', restoresNeeded)
					.multiply(data.kills);
				const normalBank = new Bank()
					.add('Saradomin brew(4)', brewsNeeded)
					.add('Super restore(4)', restoresNeeded)
					.multiply(data.kills);
				return userBank.has(heatResBank.bank) ? heatResBank : normalBank;
			},
			mostImportantStat: 'attack_crush',
			food: () => new Bank(),
			settingsKeys: [ClientSettings.EconomyStats.IgnecarusCost, ClientSettings.EconomyStats.IgnecarusLoot],
			channel: msg.channel as TextChannel,
			activity: Activity.Ignecarus,
			massText: `${msg.author.username} is assembling a team to fight Ignecarus! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			minSize: 1,
			solo: false,
			canDie: true,
			customDeathChance: (user, preCalcedDeathChance) => {
				let baseDeathChance = 95;
				const gear = user.getGear('melee');
				for (const item of [
					'Dwarven full helm',
					'Dwarven platebody',
					'Dwarven platelegs',
					'Dwarven boots',
					'Dwarven gloves'
				]) {
					if (gear.hasEquipped(item)) {
						baseDeathChance -= 9.5;
					}
				}
				if (gear.hasEquipped('Dragonfire shield')) {
					baseDeathChance -= 33;
				}
				baseDeathChance -= (100 - preCalcedDeathChance) / 10;
				return baseDeathChance;
			},
			quantity: qty,
			allowMoreThan1Solo: true,
			allowMoreThan1Group: true
		});
		const hasNormalFood = [];
		for (const user of instance.bossUsers) {
			if (user.itemsToRemove.has('Saradomin brew(4)')) {
				hasNormalFood.push(user.user.id);
			}
		}

		try {
			if (msg.flagArgs.s1mulat3) {
				return msg.channel.send({ files: [await instance.simulate()] });
			}
			const { bossUsers } = await instance.start();

			const embed = new MessageEmbed()
				.setDescription(
					`Your team is off to fight ${
						instance.quantity
					}x Ignecarus. The total trip will take ${formatDuration(instance.duration)}.

${bossUsers.map(u => `**${u.user.username}**: ${u.debugStr}`).join('\n\n')}
`
				)
				.setImage(
					'https://cdn.discordapp.com/attachments/357422607982919680/857358542456487996/grzegorz-rutkowski-dragons-breath-1920-2.jpg'
				);

			return msg.channel.send({
				embeds: [embed],
				content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : undefined
			});
		} catch (err) {
			return msg.channel.send(`The mass failed to start for this reason: ${err.message}.`);
		}
	}
}
