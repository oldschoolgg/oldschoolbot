import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { AutoslayOptionsEnum, getUsersCurrentSlayerInfo, SlayerMasterEnum } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';
import { wipeDBArrayByKey } from '../../lib/util';

interface AutoslayLink {
	monsterID: number;
	// Name and Monster must be specified if either is.
	efficientName?: string;
	efficientMonster?: number;
	efficientMethod?: string;
	slayerMasters?: SlayerMasterEnum[];
}
enum AutoSlayMethod {
	None = 'none',
	Cannon = 'cannon',
	Barrage = 'barrage',
	Burst = 'burst'
}

const AutoSlayMaxEfficiencyTable: AutoslayLink[] = [
	{
		monsterID: Monsters.Jelly.id,
		efficientName: Monsters.WarpedJelly.name,
		efficientMonster: Monsters.WarpedJelly.id,
		efficientMethod: AutoSlayMethod.Barrage
	},
	{
		monsterID: Monsters.SpiritualMage.id,
		efficientName: Monsters.SpiritualMage.name,
		efficientMonster: Monsters.SpiritualMage.id,
		efficientMethod: AutoSlayMethod.None
	},
	{
		monsterID: Monsters.SpiritualRanger.id,
		efficientName: Monsters.SpiritualMage.name,
		efficientMonster: Monsters.SpiritualMage.id,
		efficientMethod: AutoSlayMethod.None
	},
	{
		monsterID: Monsters.KalphiteWorker.id,
		efficientName: Monsters.KalphiteSoldier.name,
		efficientMonster: Monsters.KalphiteSoldier.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.Nechryael.id,
		efficientName: Monsters.GreaterNechryael.name,
		efficientMonster: Monsters.GreaterNechryael.id,
		efficientMethod: AutoSlayMethod.Barrage
	},
	{
		monsterID: Monsters.BlackDragon.id,
		efficientName: Monsters.BabyBlackDragon.name,
		efficientMonster: Monsters.BabyBlackDragon.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.Bloodveld.id,
		efficientName: Monsters.MutatedBloodveld.name,
		efficientMonster: Monsters.MutatedBloodveld.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.AberrantSpectre.id,
		efficientName: Monsters.AberrantSpectre.name,
		efficientMonster: Monsters.AberrantSpectre.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.MountainTroll.id,
		efficientName: Monsters.MountainTroll.name,
		efficientMonster: Monsters.MountainTroll.id,
		efficientMethod: AutoSlayMethod.Cannon,
		slayerMasters: [SlayerMasterEnum.Konar]
	},
	{
		monsterID: Monsters.MountainTroll.id,
		efficientName: Monsters.IceTroll.name,
		efficientMonster: Monsters.IceTroll.id,
		efficientMethod: AutoSlayMethod.Cannon,
		slayerMasters: [
			SlayerMasterEnum.Chaeldar,
			SlayerMasterEnum.Vannaka,
			SlayerMasterEnum.Nieve,
			SlayerMasterEnum.Duradel
		]
	},
	{
		monsterID: Monsters.Zygomite.id,
		efficientName: Monsters.AncientZygomite.name,
		efficientMonster: Monsters.AncientZygomite.id,
		efficientMethod: AutoSlayMethod.None
	},
	{
		monsterID: Monsters.DustDevil.id,
		efficientName: Monsters.DustDevil.name,
		efficientMonster: Monsters.DustDevil.id,
		efficientMethod: AutoSlayMethod.Barrage
	},
	{
		monsterID: Monsters.Dagannoth.id,
		efficientName: Monsters.Dagannoth.name,
		efficientMonster: Monsters.Dagannoth.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.Hellhound.id,
		efficientName: Monsters.Hellhound.name,
		efficientMonster: Monsters.Hellhound.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.ElfWarrior.id,
		efficientName: Monsters.ElfWarrior.name,
		efficientMonster: Monsters.ElfWarrior.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.Drake.id,
		efficientName: Monsters.Drake.name,
		efficientMonster: Monsters.Drake.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.Suqah.id,
		efficientName: Monsters.Suqah.name,
		efficientMonster: Monsters.Suqah.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.BlackDemon.id,
		efficientName: Monsters.BlackDemon.name,
		efficientMonster: Monsters.BlackDemon.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.GreaterDemon.id,
		efficientName: Monsters.GreaterDemon.name,
		efficientMonster: Monsters.GreaterDemon.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.SmokeDevil.id,
		efficientName: Monsters.SmokeDevil.name,
		efficientMonster: Monsters.SmokeDevil.id,
		efficientMethod: AutoSlayMethod.Barrage
	},
	{
		monsterID: Monsters.DarkBeast.id,
		efficientName: Monsters.DarkBeast.name,
		efficientMonster: Monsters.DarkBeast.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.SteelDragon.id,
		efficientName: Monsters.SteelDragon.name,
		efficientMonster: Monsters.SteelDragon.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.CaveHorror.id,
		efficientName: Monsters.CaveHorror.name,
		efficientMonster: Monsters.CaveHorror.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.Ankou.id,
		efficientName: Monsters.Ankou.name,
		efficientMonster: Monsters.Ankou.id,
		efficientMethod: AutoSlayMethod.Barrage
	},
	{
		monsterID: Monsters.BlueDragon.id,
		efficientName: Monsters.BabyBlueDragon.name,
		efficientMonster: Monsters.BabyBlueDragon.id,
		efficientMethod: AutoSlayMethod.None
	},
	{
		monsterID: Monsters.FireGiant.id,
		efficientName: Monsters.FireGiant.name,
		efficientMonster: Monsters.FireGiant.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.Hydra.id,
		efficientName: Monsters.Hydra.name,
		efficientMonster: Monsters.Hydra.id,
		efficientMethod: AutoSlayMethod.Cannon
	},
	{
		monsterID: Monsters.AbyssalDemon.id,
		efficientName: Monsters.AbyssalDemon.name,
		efficientMonster: Monsters.AbyssalDemon.id,
		efficientMethod: AutoSlayMethod.Barrage
	},
	{
		monsterID: Monsters.Lizardman.id,
		efficientName: Monsters.Lizardman.name,
		efficientMonster: Monsters.Lizardman.id,
		efficientMethod: AutoSlayMethod.Cannon
	}
];
function determineAutoslayMethod(
	m: KlasaMessage,
	passedStr: string | undefined,
	autoslayOptions: AutoslayOptionsEnum[]
) {
	const p = passedStr ? passedStr : '';
	let method = 'unknown';
	if (m.flagArgs.default || m.flagArgs.def || p === 'def' || p === 'default') {
		method = 'default';
	} else if (m.flagArgs.highest || m.flagArgs.boss || p === 'boss' || p === 'highest') {
		method = 'boss';
	} else if (m.flagArgs.ehp || m.flagArgs.efficient || p === 'ehp' || p === 'efficient') {
		method = 'ehp';
	} else if (m.flagArgs.lowest || m.flagArgs.low || p === 'lowest' || p === 'low') {
		method = 'low';
	} else if (autoslayOptions.includes(AutoslayOptionsEnum.MaxEfficiency)) {
		method = 'ehp';
	} else if (autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) {
		method = 'boss';
	} else if (autoslayOptions.includes(AutoslayOptionsEnum.LowestCombat)) {
		method = 'low';
	} else if (p === '') {
		method = 'default';
	}
	return method;
}
export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[_mode:...string]',
			aliases: ['as', 'slay'],
			usageDelim: ' ',
			description: 'Automatically chooses which monster to slay and sends your minion to kill it.',
			examples: ['+autoslay', '+autoslay highest --save', '+autoslay default']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [_mode = '']: [string]) {
		const autoslayOptions = msg.author.settings.get(UserSettings.Slayer.AutoslayOptions);
		if (_mode === 'check' || msg.flagArgs.check) {
			let autoMsg = '';
			if (autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) {
				autoMsg = 'You will automatically slay the highest combat level creatures you can.';
			} else if (autoslayOptions.includes(AutoslayOptionsEnum.MaxEfficiency)) {
				autoMsg = 'You will automatically slay the most efficient way.';
			} else if (autoslayOptions.includes(AutoslayOptionsEnum.LowestCombat)) {
				autoMsg = 'You will automatically slay the lowest combat level creature.';
			} else {
				autoMsg = 'You will automatically kill the default slayer creature you can.';
			}
			return msg.channel.send(autoMsg);
		}
		const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
		const isOnTask = usersTask.assignedTask !== null && usersTask.currentTask !== null;

		if (!isOnTask) {
			return msg.channel.send("You're not on a slayer task, so you can't autoslay!");
		}
		// Determine method:
		const method = determineAutoslayMethod(msg, _mode, autoslayOptions as AutoslayOptionsEnum[]);

		if (method === 'low') {
			// Save as default if user --save's
			if (msg.flagArgs.save && !autoslayOptions.includes(AutoslayOptionsEnum.LowestCombat)) {
				await wipeDBArrayByKey(msg.author, UserSettings.Slayer.AutoslayOptions);
				await msg.author.settings.update(UserSettings.Slayer.AutoslayOptions, AutoslayOptionsEnum.LowestCombat);
			}
			let currentLow = Number.POSITIVE_INFINITY;
			let currentMonID = 0;
			// Iterate through all potentials to get the lowest combatlevel.
			usersTask.assignedTask!.monsters.forEach(m => {
				const osjsM = Monsters.get(m);
				if (osjsM && osjsM.data.combatLevel < currentLow) {
					currentLow = osjsM.data.combatLevel;
					currentMonID = m;
				}
			});
			if (currentMonID === 0) {
				return msg.channel.send('Error: Could not get Monster data to find a task.');
			}
			return this.client.commands.get('k')?.run(msg, [null, Monsters.get(currentMonID)!.name]);
		}
		if (method === 'ehp') {
			// Save as default if user --save's
			if (msg.flagArgs.save && !autoslayOptions.includes(AutoslayOptionsEnum.MaxEfficiency)) {
				await wipeDBArrayByKey(msg.author, UserSettings.Slayer.AutoslayOptions);
				await msg.author.settings.update(
					UserSettings.Slayer.AutoslayOptions,
					AutoslayOptionsEnum.MaxEfficiency
				);
			}
			const ehpMonster = AutoSlayMaxEfficiencyTable.find(e => {
				const masterMatch = !e.slayerMasters || e.slayerMasters.includes(usersTask.currentTask!.slayerMasterID);
				return masterMatch && e.monsterID === usersTask.assignedTask!.monster.id;
			});

			const ehpKillable = killableMonsters.find(m => m.id === ehpMonster?.efficientMonster);

			// If we don't have the requirements for the efficient monster, revert to default monster
			if (
				ehpKillable?.levelRequirements !== undefined &&
				!msg.author.hasSkillReqs(ehpKillable.levelRequirements)[0]
			) {
				return this.client.commands.get('k')?.run(msg, [null, usersTask.assignedTask!.monster.name]);
			}

			if (ehpMonster && ehpMonster.efficientName) {
				if (ehpMonster.efficientMethod) msg.flagArgs[ehpMonster.efficientMethod] = 'force';
				return this.client.commands
					.get('k')
					?.run(msg, [null, ehpMonster.efficientName, ehpMonster.efficientMethod]);
			}
			return this.client.commands.get('k')?.run(msg, [null, usersTask.assignedTask!.monster.name]);
		}
		if (method === 'boss') {
			// This code handles the 'highest/boss' setting of autoslay.
			const myQPs = await msg.author.settings.get(UserSettings.QP);

			if (msg.flagArgs.save && !autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) {
				// Save highest as the default if 'highest' is toggled OFF.
				await wipeDBArrayByKey(msg.author, UserSettings.Slayer.AutoslayOptions);
				await msg.author.settings.update(
					UserSettings.Slayer.AutoslayOptions,
					AutoslayOptionsEnum.HighestUnlocked
				);
			}
			const allMonsters = killableMonsters.filter(m => {
				return usersTask.assignedTask!.monsters.includes(m.id);
			});
			if (allMonsters.length === 0)
				return msg.channel.send('Please report this error. No monster variations found.');
			let maxDiff = 0;
			let maxMobName = '';
			// Use difficultyRating for autoslay highest.
			allMonsters.forEach(m => {
				if (
					m.difficultyRating > maxDiff &&
					(m.levelRequirements === undefined || msg.author.hasSkillReqs(m.levelRequirements))
				) {
					if (m.qpRequired === undefined || m.qpRequired <= myQPs) {
						maxDiff = m.difficultyRating;
						maxMobName = m.name;
					}
				}
			});
			if (maxMobName !== '') {
				return this.client.commands.get('k')?.run(msg, [null, maxMobName]);
			}
			return msg.channel.send("Can't find any monsters you have the requirements to kill!");
		} else if (method === 'default') {
			// This code handles the default option for autoslay:
			if (msg.flagArgs.save && autoslayOptions.length) {
				// Lowest / default = none
				await wipeDBArrayByKey(msg.author, UserSettings.Slayer.AutoslayOptions);
			}
			return this.client.commands.get('k')?.run(msg, [null, usersTask.assignedTask!.monster.name]);
		}
		return msg.channel.send(`Unrecognized mode. Please use:\n\`${msg.cmdPrefix}as [default|highest|efficient]\``);
	}
}
