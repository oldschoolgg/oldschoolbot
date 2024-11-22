import { ButtonStyle, ComponentType } from 'discord.js';

import { mahojiInformationalButtons } from '../../lib/sharedComponents';
import type { OSBMahojiCommand } from '../lib/util';

export const helpCommand: OSBMahojiCommand = {
	name: 'help',
	description: 'Get information and help with the bot.',
	options: [],
	run: async () => {
		return {
			content: `🧑‍⚖️ **Rules:** You *must* follow our 5 simple rules, breaking any rule can result in a ban: <https://wiki.oldschool.gg/getting-started/rules/>

<:patreonLogo:679334888792391703> **Patreon:** If you're able too, please consider supporting my work on Patreon, it's highly appreciated and helps me hugely <https://www.patreon.com/oldschoolbot> ❤️

<:BSO:863823820435619890> **BSO:** I run a 2nd bot called BSO (Bot School Old), which you can also play, it has lots of fun and unique changes, like 5x XP and infinitely stacking clues. Invite it and read the wiki below. Ask for more information in the support server if you need!

📢 **News:** Follow <#346210791747223554> for updates and news about the bot.
☺️ **Support:** <#668073484731154462> and <#970752140324790384>

Please click the buttons below for important links.`,
			embeds: [
				{
					title: 'BSO',
					description:
						'Bot School Old (BSO) is a copy of Old School Bot (OSB) that you can play alongside it, it has very fun changes like: 5x XP, 2x faster pvm, HUNDREDS of custom items, pets, monsters and bosses. It works exactly the same as OSB. Just invite it to your server using <https://www.oldschool.gg/invite/bso> and `/minion buy` on it to get started!'
				}
			],
			components: [
				{
					type: ComponentType.ActionRow,
					components: mahojiInformationalButtons
				},
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: 'Invite BSO',
							emoji: { id: '863823820435619890' },
							style: ButtonStyle.Link,
							url: 'https://www.oldschool.gg/invite/bso'
						},
						{
							type: ComponentType.Button,
							label: 'BSO Wiki',
							emoji: { id: '863823820435619890' },
							style: ButtonStyle.Link,
							url: 'https://bso-wiki.oldschool.gg/'
						}
					]
				}
			]
		};
	}
};
