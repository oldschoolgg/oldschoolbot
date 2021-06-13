import { MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Emoji, Time } from '../../lib/constants';
import { GearSetupTypes } from '../../lib/gear/types';
import KingGoldemar from '../../lib/minions/data/killableMonsters/custom/KingGoldemar';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BossInstance, gpCostPerKill } from '../../lib/structures/Boss';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { formatDuration, toKMB } from '../../lib/util';

export const kgBaseTime = Time.Minute * 45;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			aliases: ['kg']
		});
	}

	async run(msg: KlasaMessage) {
		const instance = new BossInstance({
			leader: msg.author,
			id: KingGoldemar.id,
			baseDuration: Time.Minute * 120,
			baseFoodRequired: 500,
			skillRequirements: {
				attack: 105,
				strength: 105,
				defence: 105
			},
			itemBoosts: [
				['Drygore longsword', 10],
				['Offhand drygore longsword', 5],
				['Gorajan warrior helmet', 2],
				['Gorajan warrior top', 4],
				['Gorajan warrior legs', 2],
				['Gorajan warrior gloves', 1],
				['Gorajan warrior boots', 1],
				["Brawler's hook necklace", 4]
			],
			customDenier: async () => {
				return [false];
			},
			bisGear: new Gear({
				head: 'Gorajan warrior helmet',
				body: 'Gorajan warrior top',
				legs: 'Gorajan warrior legs',
				hands: 'Gorajan warrior gloves',
				feet: 'Gorajan warrior boots',
				cape: 'Abyssal cape',
				ring: 'Warrior ring(i)',
				weapon: 'Drygore longsword',
				shield: 'Offhand drygore longsword',
				neck: "Brawler's hook necklace"
			}),
			gearSetup: GearSetupTypes.Melee,
			itemCost: async user => new Bank().add('Coins', gpCostPerKill(user)),
			mostImportantStat: 'attack_slash',
			food: () => new Bank(),
			settingsKeys: [
				ClientSettings.EconomyStats.KingGoldemarCost,
				ClientSettings.EconomyStats.KingGoldemarLoot
			],
			channel: msg.channel as TextChannel,
			activity: Activity.KingGoldemar,
			massText: `${msg.author.username} is assembling a team to fight King Goldemar! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			minSize: 1,
			solo: false,
			canDie: true
		});
		try {
			if (msg.flagArgs.s1mulat3) {
				return msg.channel.send(await instance.simulate());
			}
			const { bossUsers } = await instance.start();
			const embed = new MessageEmbed()
				.setDescription(
					`Your group approaches the Kings' chambers, and each of you bribes the Kings Guards with a big bag of gold (${toKMB(
						10_000_000
					)} each) to let you into his chambers. The guards accept the offer and let you in, as they run away. The total trip will take ${formatDuration(
						instance.duration
					)}.

${bossUsers.map(u => `**${u.user.username}**: ${u.debugStr}`).join('\n\n')}
`
				)
				.setImage(
					'https://cdn.discordapp.com/attachments/357422607982919680/841789326648016896/Untitled-2.png'
				);

			return msg.channel.send(embed);
		} catch (err) {
			return msg.channel.send(`The mass failed to start for this reason: ${err.message}.`);
		}
	}
}
