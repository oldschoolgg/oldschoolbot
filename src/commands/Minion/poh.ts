import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { requiresMinion } from '../../lib/minions/decorators';
import { PoHObjects } from '../../lib/poh';
import { SkillsEnum } from '../../lib/skilling/types';
import { PoHTable } from '../../lib/typeorm/PoHTable.entity';
import { stringMatches } from '../../lib/util';
import PoHImage from '../../tasks/pohImage';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to do barbarian assault, or buy rewards and gamble.',
			examples: ['+pohfff [start]'],
			subcommands: true,
			usage: '[build|destroy] [input:...str]',
			usageDelim: ' '
		});
	}

	async getPOH(msg: KlasaMessage): Promise<PoHTable> {
		const poh = await PoHTable.findOne({ user_id: msg.author.id });
		if (poh !== undefined) return poh;
		await PoHTable.insert({ user_id: msg.author.id });
		const created = await PoHTable.findOne({ user_id: msg.author.id });
		if (!created) {
			throw new Error('Failed to find POH after creation.');
		}
		return created;
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const poh = await this.getPOH(msg);
		return msg.send(await this.genImage(poh));
	}

	genImage(poh: PoHTable) {
		return (this.client.tasks.get('pohImage') as PoHImage).run(poh);
	}

	async build(msg: KlasaMessage, [name]: [string]) {
		const obj = PoHObjects.find(i => stringMatches(i.name, name));
		if (!obj) {
			return msg.send(`That's not a valid thing to build in your PoH.`);
		}

		const level = msg.author.skillLevel(SkillsEnum.Construction);
		if (level < obj.level) {
			return msg.send(
				`You need level ${obj.level} Construction to build a ${obj.name} in your house.`
			);
		}

		// if already has something built there, warn
		// requiredinplace
		const poh = await this.getPOH(msg);
		poh[obj.slot] = obj.id;
		await poh.save();
		return msg.send(
			`You built a ${obj.name} in your house, using ${obj.itemCost}.`,
			await this.genImage(poh)
		);
	}

	async destroy(msg: KlasaMessage, [name]: [string]) {
		const obj = PoHObjects.find(i => stringMatches(i.name, name));
		if (!obj) {
			return msg.send(`That's not a valid thing to build in your PoH.`);
		}

		const poh = await this.getPOH(msg);
		poh[obj.slot] = null;
		await poh.save();
		return msg.send(`You removed a ${obj.name} from your house.`, await this.genImage(poh));
	}
}
