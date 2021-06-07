import { CommandStore, KlasaMessage } from 'klasa';

import { Monsters } from 'oldschooljs';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { slayerMasters } from '../../lib/slayer/slayerMasters';
import { SlayerRewardsShop } from '../../lib/slayer/slayerUnlocks';
import {
	assignNewSlayerTask,
	calcMaxBlockedTasks,
	getCommonTaskName,
	getUsersCurrentSlayerInfo,
	userCanUseMaster
} from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';


export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			categoryFlags: ['minion'],
			aliases: ['st'],
			description: 'slayer',
			examples: ['+skillcape mining'],
			usage: '[input:str]'
		});
	}

	async run(msg: KlasaMessage, [input]: [string | undefined]) {
		const { currentTask, totalTasksDone, assignedTask } = await getUsersCurrentSlayerInfo(
			msg.author.id
		);
		const myBlockList = await msg.author.settings.get(UserSettings.Slayer.BlockedTasks) ?? [];
		const myQPs = await msg.author.settings.get(UserSettings.QP) ?? 0;

		const maxBlocks = calcMaxBlockedTasks(myQPs);
		if(
			msg.flagArgs.listblocks
			|| msg.flagArgs.list
			|| (input && input === "listblocks")
			|| (input && input === "list")
		) {
			let mobs : string[] = [];
			let outstr = `You have a maximum of ${maxBlocks} task blocks. You are using ${myBlockList.length}` +
				` and have ${maxBlocks - myBlockList.length} remaining\n\nBlocked Tasks:\n`;
			const myBlockedMonsters = Monsters.filter(m => { return myBlockList.includes(m.id) });
			myBlockedMonsters.forEach(m => {mobs.push(`${m.id}: ${getCommonTaskName(m)}`)});
			outstr += mobs.join(`\n`);
			return msg.channel.send(`${outstr}\n\nTry: \`${msg.cmdPrefix}st --block\` to block a task.`);
		}

		if (msg.flagArgs.unblock) {
			if (!input) {
				throw `You must specify a monster to unblock!`;
			}
			let osjsMonster;
			let idToRemove = parseInt(input);
			if (isNaN(idToRemove)) {
				// Lets lookup the ID from the name:
				osjsMonster = Monsters.find(mon =>
					mon.aliases.some(alias => stringMatches(alias, input)));
				if (!osjsMonster) {
					throw `Failed to find a monster with that name!`;
				}
				idToRemove = osjsMonster.id;
			} else {
				osjsMonster = Monsters.find(mon => mon.id === idToRemove);
				if (!osjsMonster) {
					throw `Failed to find a monster with that id!`;
				}
			}
			// Now we can remove based on ID.
			if (!myBlockList.includes(idToRemove)) {
				return msg.channel.send(`${idToRemove}: ${osjsMonster.name} is not on the block list!`);
			}
			if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
				const alchMessage = await msg.channel.send(
					`Really unblock ${osjsMonster.name}s? You will have to pay to block it again ` +
						`in the future.\n\nType **confirm** to unblock.`
				);
				try {
					await msg.channel.awaitMessages(
						_msg =>
							_msg.author.id === msg.author.id &&
							_msg.content.toLowerCase() === 'confirm',
						{
							max: 1,
							time: 10_000,
							errors: ['time']
						}
					);
				} catch (err) {
					return alchMessage.edit(`Not unblocking ${osjsMonster.name}s.`);
				}
			}
			await msg.author.settings.update(UserSettings.Slayer.BlockedTasks, idToRemove);
			return msg.channel.send(`${osjsMonster.name}s have been unblocked`);
		}
		if (currentTask && (msg.flagArgs.skip || msg.flagArgs.block)) {
			const toBlock = msg.flagArgs.block ? true : false;
			if (toBlock && myBlockList.length >= maxBlocks) {
				return msg.channel.send(
					`You cannot have more than ${maxBlocks} slayer blocks!\n\nUse:\n` +
						`\`${msg.cmdPrefix}st --unblock MONSTER_ID\`\n to remove a block.\n` +
						`\`${msg.cmdPrefix}st --list\` for list of blocked monsters and their IDs.`
				);
			}
			let slayerPoints = msg.author.settings.get(UserSettings.Slayer.SlayerPoints) ?? 0;
			if (slayerPoints < (toBlock ? 100 : 30)) {
				return msg.send(`You need ${toBlock ? 100 : 30} points to ${toBlock ? 'block' : 'cancel'},` +
					` you only have: ${slayerPoints}`);
			}
			if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
				const alchMessage = await msg.channel.send(
					`Really ${toBlock ? 'block' : 'skip'} task? This will cost ${toBlock ? 100 : 30}` +
						` slayer points.\n\nType **confirm** to ${toBlock ? 'block' : 'skip'}.`
				);

				try {
					await msg.channel.awaitMessages(
						_msg =>
							_msg.author.id === msg.author.id &&
							_msg.content.toLowerCase() === 'confirm',
						{
							max: 1,
							time: 10_000,
							errors: ['time']
						}
					);
				} catch (err) {
					return alchMessage.edit(`Not ${toBlock ? 'blocking' : 'skipping'} slayer task.`);
				}
			}
			slayerPoints -= toBlock ? 100 : 30;
			await msg.author.settings.update(UserSettings.Slayer.SlayerPoints, slayerPoints);
			if(toBlock)
				await msg.author.settings.update(UserSettings.Slayer.BlockedTasks, currentTask.monsterID);
			currentTask!.quantityRemaining = 0;
			currentTask!.skipped = true;
			currentTask!.save();
			return msg.send(`Your task has been ${toBlock ? 'blocked' : 'skipped'}.`);
		}

		let rememberedSlayerMaster: string = '';
		if (msg.flagArgs.unfav || msg.flagArgs.delete || msg.flagArgs.forget) {
			await msg.author.settings.update(UserSettings.Slayer.RememberSlayerMaster, null);
		} else {
			rememberedSlayerMaster =
				msg.author.settings.get(UserSettings.Slayer.RememberSlayerMaster) ?? '';
		}

		// Match on input slayermaster if specified, falling back to remembered.
		const slayerMaster = input
			? slayerMasters
					.filter(m => userCanUseMaster(msg.author, m))
					.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
			: rememberedSlayerMaster !== ''
			? slayerMasters
					.filter(m => userCanUseMaster(msg.author, m))
					.find(m =>
						m.aliases.some(alias => stringMatches(alias, rememberedSlayerMaster))
					) ?? null
			: null;

		// TODO: Delete this
		msg.author.log(`Remembered: ${rememberedSlayerMaster}`);
		msg.author.log(`slayermaster: ${slayerMaster?.name}`);

		const matchedSlayerMaster = input
			? slayerMasters.find(m => m.aliases.some(alias => stringMatches(alias, input))) ?? null
			: null;

		// Special handling for Turael skip
		if (currentTask && input && slayerMaster && slayerMaster.name === 'Turael') {
			// TODO: Make sure they aren't already on a Turael task.
			if (slayerMaster.tasks.find(t => t.monster.id === currentTask.monsterID)) {
				return msg.send(`You cannot skip this task because Turael assigns it.`);
			}
			if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
				const alchMessage = await msg.channel.send(
					`Really cancel task? This will reset your streak to 0 and give you a new` +
						` ${slayerMaster.name} task.\n\nType **confirm** to skip.`
				);

				try {
					await msg.channel.awaitMessages(
						_msg =>
							_msg.author.id === msg.author.id &&
							_msg.content.toLowerCase() === 'confirm',
						{
							max: 1,
							time: 10_000,
							errors: ['time']
						}
					);
				} catch (err) {
					return alchMessage.edit(`Not cancelling slayer task.`);
				}
			}

			currentTask!.quantityRemaining = 0;
			currentTask!.skipped = true;
			currentTask!.save();
			msg.author.settings.update(UserSettings.Slayer.TaskStreak, 0);
			const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);
			let commonName = getCommonTaskName(newSlayerTask.assignedTask.monster);
			return msg.channel.send(
				`Your task has been skipped.\n\n ${slayerMaster.name}` +
					` has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${commonName}.`
			);
		}
		if (currentTask || !slayerMaster) {
			let warningInfo = '';
			if (input && !slayerMaster && matchedSlayerMaster) {
				let aRequirements: string[] = [];
				if (matchedSlayerMaster.slayerLvl)
					aRequirements.push(`Slayer Level: ${matchedSlayerMaster.slayerLvl}`);
				if (matchedSlayerMaster.combatLvl)
					aRequirements.push(`Combat Level: ${matchedSlayerMaster.combatLvl}`);
				if (matchedSlayerMaster.questPoints)
					aRequirements.push(`Quest points: ${matchedSlayerMaster.questPoints}`);
				warningInfo = `You do not have the requirements to use ${matchedSlayerMaster.name}.\n\n`;
				if (aRequirements.length)
					warningInfo += `**Requires**:\n${aRequirements.join(`\n`)}\n\n`;
			}
			let alternateMonsters: string[] = [];
			let monsterList = '';
			if (currentTask && assignedTask) {
				const altMobs = assignedTask.monsters;
				altMobs.forEach(m => {
					const monster = killableMonsters.find(mon => mon.id === m);
					alternateMonsters.push(monster!.name);
				});
				monsterList = alternateMonsters.length > 1
					? ` ${alternateMonsters.join(`/`)}\n`
					: '';
			}
			let baseInfo = currentTask
				? `Your current task is to kill ${currentTask.quantity}x ${getCommonTaskName(
						assignedTask!.monster
				  )}${monsterList}, you have ${
						currentTask.quantityRemaining
				  } kills remaining.`
				: `You have no task at the moment <:FrogBigEyes:847859910933741628> You can get a task using \`${
						msg.cmdPrefix
				  }slayertask ${slayerMasters.map(i => i.name).join('/')}\``;

			return msg.channel.send(`${warningInfo}${baseInfo}
	
You've done ${totalTasksDone} tasks. Your current streak is ${msg.author.settings.get(
				UserSettings.Slayer.TaskStreak
			)}.`);
		}

		// Store favorite slayer master if requested:
		if (msg.flagArgs.remember || msg.flagArgs.fav || msg.flagArgs.save) {
			await msg.author.settings.update(
				UserSettings.Slayer.RememberSlayerMaster,
				slayerMaster.name
			);
		}

		const newSlayerTask = await assignNewSlayerTask(msg.author, slayerMaster);
		const myUnlocks =
			(await msg.author.settings.get(UserSettings.Slayer.SlayerUnlocks)) ?? undefined;
		if (myUnlocks) {
			SlayerRewardsShop.filter(srs => {
				return srs.extendID !== undefined;
			}).forEach(srsf => {
				if (
					myUnlocks.includes(srsf.id) &&
					srsf.extendID!.includes(newSlayerTask.currentTask.monsterID)
				) {
					newSlayerTask.currentTask.quantity = Math.ceil(
						newSlayerTask.currentTask.quantity * srsf.extendMult!
					);
					newSlayerTask.currentTask.quantityRemaining =
						newSlayerTask.currentTask.quantity;
					newSlayerTask.currentTask.save();
				}
			});
		}

		let commonName = getCommonTaskName(newSlayerTask.assignedTask.monster);
		return msg.channel.send(
			`${slayerMaster.name} has assigned you to kill ${newSlayerTask.currentTask.quantity}x ${commonName}.`
		);
	}
}
