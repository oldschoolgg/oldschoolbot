import { type APIButtonComponent, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

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

export const informationalButtons = buttonSource.map(i =>
	new ButtonBuilder().setLabel(i.label).setEmoji(i.emoji).setURL(i.url).setStyle(ButtonStyle.Link)
);
export const mahojiInformationalButtons: APIButtonComponent[] = buttonSource.map(i => ({
	type: ComponentType.Button,
	label: i.label,
	emoji: { id: i.emoji },
	style: ButtonStyle.Link,
	url: i.url
}));

export const minionBuyButton = new ButtonBuilder()
	.setCustomId('BUY_MINION')
	.setLabel('Buy Minion')
	.setStyle(ButtonStyle.Success);
