import { MessageEmbed, TextChannel } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import { Naxxus } from '../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BossInstance } from '../../lib/structures/Boss';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { formatDuration } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[qty:int{1,100}]',
			usageDelim: ' ',
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES']
		});
	}

	async run(msg: KlasaMessage, [qty]: [number]) {
		const instance = new BossInstance({
			leader: msg.author,
			id: Naxxus.id,
			baseDuration: Time.Minute * 20,
			skillRequirements: {
        slayer: 110,
        magic: 120
      },
			itemBoosts: [
				['Void staff', 10],
				['Abyssal Tome', 7.5],
				['Spellbound Ring (i)', 2.5],
				['Spellbound Ring', 2]
			],
			customDenier: async () => {
				return [false];
			},
			bisGear: new Gear({
				head: 'Gorajan occult helmet',
				body: 'Gorajan occult top',
				legs: 'Gorajan occult legs',
				hands: 'Gorajan occult gloves',
				feet: 'Gorajan occult boots',
				cape: 'Vasa cloak',
				ring: 'Seers ring(i)',
				weapon: 'Virtus wand',
				shield: 'Virtus book',
				neck: 'Arcane blast necklace'
			}),
			gearSetup: 'mage',
			itemCost: async data =>	data.baseFood.multiply(data.kills),
			mostImportantStat: 'attack_magic',
			food: () => new Bank(),
			settingsKeys: [ClientSettings.EconomyStats.NaxxusCost, ClientSettings.EconomyStats.NaxxusLoot],
			channel: msg.channel as TextChannel,
			activity: 'Naxxus',
			massText: `${msg.author.username} is assembling a team to fight Naxxus! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			minSize: 1,
			solo: true,
			canDie: false,
			allowMoreThan1Solo: true,
			quantity: qty
		});
		try {
			if (msg.flagArgs.s1mulat3) {
				return msg.channel.send({ files: [await instance.simulate()] });
			}
			const { bossUsers } = await instance.start();
			const embed = new MessageEmbed().setDescription(
				`Your team is off to fight ${instance.quantity}x Vasa Magus. The total trip will take ${formatDuration(
					instance.duration
				)}.

${bossUsers.map(u => `**${u.user.username}**: ${u.debugStr}`).join('\n\n')}
`
			)
      .setImage(
        'https://cdn.discordapp.com/attachments/920771763976167455/935659463434698783/179ad8548cf42d494bfb473171a1124b.jpg'
      );

			return msg.channel.send({
				embeds: [embed],
				content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : undefined
			});
		} catch (err: any) {
			return msg.channel.send(`The mass failed to start for this reason: ${err.message}.`);
		}
	}
}
