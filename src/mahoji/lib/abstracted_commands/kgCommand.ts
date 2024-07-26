import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';

import KingGoldemar from '../../../lib/minions/data/killableMonsters/custom/bosses/KingGoldemar';
import { BossInstance, gpCostPerKill } from '../../../lib/structures/Boss';
import { Gear } from '../../../lib/structures/Gear';
import { channelIsSendable, formatDuration } from '../../../lib/util';
import { deferInteraction } from '../../../lib/util/interactionReply';

export async function kgCommand(
	interaction: ChatInputCommandInteraction | null,
	user: MUser,
	channelID: string,
	inputName: string,
	quantity: number | undefined
) {
	if (interaction) await deferInteraction(interaction);
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return 'Invalid channel.';
	const type = inputName.toLowerCase().includes('mass') ? 'mass' : 'solo';
	const instance = new BossInstance({
		leader: user,
		id: KingGoldemar.id,
		baseDuration: Time.Minute * 120,
		skillRequirements: {
			attack: 105,
			strength: 105,
			defence: 105
		},
		speedMaxReduction: 45,
		boostMax: 40,
		itemBoosts: [
			['Axe of the high sungod', 20],
			['Drygore longsword', 10],
			['Offhand drygore longsword', 5],
			['Gorajan warrior helmet', 2],
			['Gorajan warrior top', 4],
			['Gorajan warrior legs', 2],
			['Gorajan warrior gloves', 1],
			['Gorajan warrior boots', 1],
			["Brawler's hook necklace", 4],
			['TzKal cape', 6]
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
			cape: 'TzKal cape',
			ring: 'Warrior ring(i)',
			'2h': 'Axe of the high sungod',
			neck: "Brawler's hook necklace"
		}),
		gearSetup: 'melee',
		itemCost: async data => data.baseFood.multiply(data.kills).add('Coins', gpCostPerKill(data.user) * data.kills),
		mostImportantStat: 'attack_slash',
		ignoreStats: ['attack_ranged', 'attack_magic'],
		food: () => new Bank(),
		channel,
		activity: 'KingGoldemar',
		massText: `${user.usernameOrMention} is assembling a team to fight King Goldemar! Use the buttons below to join/leave.`,
		minSize: 1,
		solo: type === 'solo',
		canDie: true,
		kcLearningCap: 50,
		quantity
	});
	try {
		const { bossUsers } = await instance.start();
		const embed = new EmbedBuilder()
			.setDescription(
				`${type === 'solo' ? 'You approach' : 'Your group approaches'} the Kings' chambers, and ${
					type === 'solo' ? 'you bribe' : 'each of you bribes'
				} the Kings Guards with a big bag of gold (${toKMB(
					10_000_000
				)} each) to let you into his chambers. The guards accept the offer and let you in, as they run away. The total trip will take ${formatDuration(
					instance.duration
				)}.

${bossUsers.map(u => `**${u.user.usernameOrMention}**: ${u.debugStr}`).join('\n\n')}
`
			)
			.setImage('https://cdn.discordapp.com/attachments/357422607982919680/841789326648016896/Untitled-2.png');

		return {
			embeds: [embed.data],
			content: instance.boosts.length > 0 ? `**Boosts:** ${instance.boosts.join(', ')}.` : 'No boosts.'
		};
	} catch (err: any) {
		return `The mass failed to start for this reason: ${err}.`;
	}
}
