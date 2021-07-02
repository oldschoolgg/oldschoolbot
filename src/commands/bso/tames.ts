import { calcWhatPercent, increaseNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Time } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { getUsersTame } from '../../lib/tames';
import { TameActivityTable } from '../../lib/typeorm/TameActivityTable.entity';
import { TameGrowthStage, TamesTable } from '../../lib/typeorm/TamesTable.entity';
import { formatDuration, stringMatches } from '../../lib/util';
import findMonster from '../../lib/util/findMonster';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Allows you to access and build in your POH.',
			examples: ['+poh build demonic throne', '+poh', '+poh items', '+poh destroy demonic throne'],
			subcommands: true,
			usage: '[k|select|setname] [input:...str]',
			usageDelim: ' ',
			aliases: ['tame']
		});
	}

	async setname(msg: KlasaMessage, [name = '']: [string]) {
		if (
			!name ||
			typeof name !== 'string' ||
			name.length < 2 ||
			name.length > 30 ||
			['\n', '`', '@', '<', ':'].some(char => name.includes(char))
		) {
			return msg.send("That's not a valid name for your tame.");
		}
		const [selectedTame] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame to set a nickname for, select one first.');
		}
		selectedTame.nickname = name;
		await selectedTame.save();
		return msg.channel.send(`Updated the nickname of your selected tame to ${name}.`);
	}

	@requiresMinion
	async run(msg: KlasaMessage, [input]: [string | undefined]) {
		const allTames = await TamesTable.find({
			where: { userID: msg.author.id }
		});
		if (allTames.length === 0) {
			return msg.channel.send('You have no tames.');
		}
		if (input) {
			const tame = allTames.find(
				t => stringMatches(t.id.toString(), input) || stringMatches(t.nickname ?? '', input)
			);
			if (!tame) {
				return msg.channel.send('No matching tame found.');
			}
			return msg.channel.sendBankImage({
				content: `${tame!.toString()}`,
				bank: tame.totalLoot,
				title: `All Loot ${tame.name} Has Gotten You`
			});
		}
		const [selectedTame] = await getUsersTame(msg.author);
		return msg.channel.send(
			`Your tames:
${allTames
	.map(
		t =>
			`${t.id}. ${t.toString()}${
				t?.growthStage === TameGrowthStage.Adult ? '' : ` ${t?.currentGrowthPercent}% grown ${t.growthStage}`
			}${selectedTame?.id === t.id ? ' *Selected*' : ''}`
	)
	.join('\n')}`
		);
	}

	async select(msg: KlasaMessage, [str = '']: [string]) {
		const tames = await TamesTable.find({ where: { userID: msg.author.id } });
		const toSelect = tames.find(t => stringMatches(str, t.id.toString()) || stringMatches(str, t.nickname ?? ''));
		if (!toSelect) {
			return msg.channel.send("Couldn't find a tame to select.");
		}
		const [, currentTask] = await getUsersTame(msg.author);
		if (currentTask) {
			return msg.channel.send("You can't select a different tame, because your current one is busy.");
		}
		await msg.author.settings.update(UserSettings.SelectedTame, toSelect.id);
		return msg.channel.send(`You selected your ${toSelect.name}.`);
	}

	async k(msg: KlasaMessage, [str = '']: [string]) {
		const [selectedTame, currentTask] = await getUsersTame(msg.author);
		if (!selectedTame) {
			return msg.channel.send('You have no selected tame.');
		}
		if (currentTask) {
			return msg.channel.send(`${selectedTame.name} is busy.`);
		}
		const monster = findMonster(str);
		if (!monster) {
			return msg.channel.send("That's not a valid monster.");
		}
		let speed = monster.timeToFinish * selectedTame.growthLevel;
		speed = increaseNumByPercent(
			speed,
			calcWhatPercent(selectedTame.combatLvl, selectedTame.maxCombatLevel - selectedTame.combatLvl)
		);
		const quantity = Math.floor(Time.Hour / speed);
		if (quantity < 1) {
			return msg.channel.send("Your tame can't kill this monster fast enough.");
		}
		const duration = Math.floor(quantity * speed);

		const activity = new TameActivityTable();
		activity.userID = msg.author.id;
		activity.startDate = new Date();
		activity.finishDate = new Date(Date.now() + duration);
		activity.completed = false;
		activity.type = 'pvm';
		activity.data = {
			type: 'pvm',
			monsterID: monster.id,
			quantity
		};
		activity.channelID = msg.channel.id;
		activity.duration = duration;
		activity.tame = selectedTame;
		await activity.save();

		return msg.channel.send(
			`${selectedTame.name} is now killing ${quantity}x ${monster.name}. The trip will take ${formatDuration(
				duration
			)}.`
		);
	}
}
