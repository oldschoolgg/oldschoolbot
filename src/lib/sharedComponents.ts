import { ButtonBuilder, ButtonStyle, ComponentType } from '@oldschoolgg/discord';

import { EmojiId } from '@/lib/data/emojis.js';
import { InteractionID } from '@/lib/InteractionID.js';

const buttonSource = [
	{
		label: 'Wiki',
		emoji: '802136964027121684',
		url: 'https://wiki.oldschool.gg/'
	},
	{
		label: 'Patreon',
		emoji: '679334888792391703',
		url: 'https://www.patreon.com/oldschoolbot'
	},
	{
		label: 'Support Server',
		emoji: '778418736180494347',
		url: 'https://www.discord.gg/ob'
	},
	{
		label: 'Bot Invite',
		emoji: '778418736180494347',
		url: 'http://www.oldschool.gg/invite/osb'
	}
];

export const informationalButtons: ButtonBuilder[] = buttonSource.map(i =>
	new ButtonBuilder().setLabel(i.label).setEmoji({ id: i.emoji }).setURL(i.url).setStyle(ButtonStyle.Link)
);
export const mahojiInformationalButtons = buttonSource.map(
	i =>
		new ButtonBuilder({
			type: ComponentType.Button,
			label: i.label,
			emoji: { id: i.emoji },
			style: ButtonStyle.Link,
			url: i.url
		})
);

export const minionBuyButton = new ButtonBuilder()
	.setCustomId(InteractionID.Commands.BuyMinion)
	.setLabel('Buy Minion')
	.setStyle(ButtonStyle.Success);

export const becomeIronmanButton = new ButtonBuilder()
	.setCustomId(InteractionID.Commands.BecomeIronman)
	.setLabel('Become Ironman')
	.setEmoji({ id: '626647335900020746' })
	.setStyle(ButtonStyle.Secondary);

export const learningTheRopesButton = new ButtonBuilder()
	.setCustomId(InteractionID.Commands.StartLearningTheRopes)
	.setLabel('Start Learning the Ropes')
	.setEmoji({ id: EmojiId.Leagues })
	.setStyle(ButtonStyle.Primary);
