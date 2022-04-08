import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import backgroundImages from '../../lib/minions/data/bankBackgrounds';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import PostgresProvider from '../../providers/postgres';

type BankQueryResult = { bankBackground: number; count: string }[];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['bstats'],
			perkTier: PerkTier.Four,
			subcommands: true,
			usage: '<servers|minions|ironmen|sacrificed|bankbg|monsters|clues|icons>',
			cooldown: 60,
			description: 'Allows you to see various statistics about the bot.',
			examples: [
				'+bstats servers',
				'+bstats minions',
				'+bstats ironmen',
				'+bstats sacrificed',
				'+bstats bankbg',
				'+bstats monsters',
				'+bstats clues',
				'+bstats icons'
			],
			categoryFlags: ['patron', 'utility']
		});
	}

	async _query(str: string): Promise<any> {
		return (this.client.providers.default as PostgresProvider).runAll(str);
	}

	async servers(msg: KlasaMessage) {
		return msg.channel.send(`Old School Bot is in ${this.client.guilds.cache.size} servers.`);
	}

	async minions(msg: KlasaMessage) {
		const result = await this._query('SELECT COUNT(*) FROM users WHERE "minion.hasBought" = true;');

		return msg.channel.send(`There are ${result[0].count.toLocaleString()} minions!`);
	}

	async icons(msg: KlasaMessage) {
		const result: { icon: string | null; qty: number }[] = await this._query(
			'SELECT "minion.icon" as icon, COUNT(*) as qty FROM users WHERE "minion.icon" is not null group by "minion.icon" order by qty asc;'
		);
		return msg.channel.send(
			`**Current minion tiers and their number of users:**\n${Object.values(result)
				.map(row => `${row.icon ?? '<:minion:763743627092164658>'} : ${row.qty}`)
				.join('\n')}`
		);
	}

	async ironmen(msg: KlasaMessage) {
		const result = await this._query('SELECT COUNT(*) FROM users WHERE "minion.ironman" = true;');

		return msg.channel.send(`There are ${parseInt(result[0].count).toLocaleString()} ironman minions!`);
	}

	async sacrificed(msg: KlasaMessage) {
		const result = await this._query('SELECT SUM ("sacrificedValue") AS total FROM users;');

		return msg.channel.send(
			`There has been ${parseInt(result[0].total).toLocaleString()} GP worth of items sacrificed!`
		);
	}

	async bankbg(msg: KlasaMessage) {
		const result: BankQueryResult = await this._query(`SELECT "bankBackground", COUNT(*)
FROM users
WHERE "bankBackground" <> 1
GROUP BY "bankBackground";`);

		return msg.channel.send(
			result
				.map(
					res =>
						`**${backgroundImages[res.bankBackground - 1].name}:** ${parseInt(res.count).toLocaleString()}`
				)
				.join('\n')
		);
	}

	async monsters(msg: KlasaMessage) {
		const totalBank: { [key: string]: number } = {};

		const res: any = await this._query(
			'SELECT ARRAY(SELECT "monsterScores" FROM users WHERE "monsterScores"::text <> \'{}\'::text);'
		);

		const banks: ItemBank[] = res[0].array;

		banks.map(bank => {
			for (const [id, qty] of Object.entries(bank)) {
				if (!totalBank[id]) totalBank[id] = qty;
				else totalBank[id] += qty;
			}
		});

		return msg.channel.send(
			Object.entries(totalBank)
				.sort(([, qty1], [, qty2]) => qty2 - qty1)
				.map(([monID, qty]) => {
					return `**${Monsters.get(parseInt(monID))?.name}:** ${qty.toLocaleString()}`;
				})
				.join('\n')
		);
	}

	async clues(msg: KlasaMessage) {
		const totalBank: { [key: string]: number } = {};

		const res: any = await this._query(
			'SELECT ARRAY(SELECT "clueScores" FROM users WHERE "clueScores"::text <> \'{}\'::text);'
		);

		const banks: ItemBank[] = res[0].array;

		banks.map(bank => {
			for (const [id, qty] of Object.entries(bank)) {
				if (!totalBank[id]) totalBank[id] = qty;
				else totalBank[id] += qty;
			}
		});

		return msg.channel.send(
			Object.entries(totalBank)
				.map(
					([clueID, qty]) =>
						`**${ClueTiers.find(t => t.id === parseInt(clueID))?.name}:** ${qty.toLocaleString()}`
				)
				.join('\n')
		);
	}
}
