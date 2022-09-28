import { ChatInputCommandInteraction } from 'discord.js';
import { Monsters } from 'oldschooljs';

import { PvMMethod } from '../../../lib/constants';
import killableMonsters from '../../../lib/minions/data/killableMonsters';
import { runCommand } from '../../../lib/settings/settings';
import { autoslayModes, AutoslayOptionsEnum } from '../../../lib/slayer/constants';
import { getCommonTaskName, getUsersCurrentSlayerInfo, SlayerMasterEnum } from '../../../lib/slayer/slayerUtil';
import { hasSkillReqs, isGuildChannel, stringMatches } from '../../../lib/util';
import { slayerNewTaskCommand } from './slayerTaskCommand';

interface AutoslayLink {
	monsterID: number;
	// Name and Monster must be specified if either is.
	efficientName?: string;
	efficientMonster?: number;
	efficientMethod?: PvMMethod;
	slayerMasters?: SlayerMasterEnum[];
}

const AutoSlayMaxEfficiencyTable: AutoslayLink[] = [
	{
		monsterID: Monsters.Jelly.id,
		efficientName: Monsters.WarpedJelly.name,
		efficientMonster: Monsters.WarpedJelly.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.SpiritualMage.id,
		efficientName: Monsters.SpiritualMage.name,
		efficientMonster: Monsters.SpiritualMage.id,
		efficientMethod: 'none'
	},
	{
		monsterID: Monsters.SpiritualRanger.id,
		efficientName: Monsters.SpiritualMage.name,
		efficientMonster: Monsters.SpiritualMage.id,
		efficientMethod: 'none'
	},
	{
		monsterID: Monsters.KalphiteWorker.id,
		efficientName: Monsters.KalphiteSoldier.name,
		efficientMonster: Monsters.KalphiteSoldier.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Nechryael.id,
		efficientName: Monsters.GreaterNechryael.name,
		efficientMonster: Monsters.GreaterNechryael.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.BlackDragon.id,
		efficientName: Monsters.BabyBlackDragon.name,
		efficientMonster: Monsters.BabyBlackDragon.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Bloodveld.id,
		efficientName: Monsters.MutatedBloodveld.name,
		efficientMonster: Monsters.MutatedBloodveld.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.AberrantSpectre.id,
		efficientName: Monsters.AberrantSpectre.name,
		efficientMonster: Monsters.AberrantSpectre.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.MountainTroll.id,
		efficientName: Monsters.MountainTroll.name,
		efficientMonster: Monsters.MountainTroll.id,
		efficientMethod: 'cannon',
		slayerMasters: [SlayerMasterEnum.Konar]
	},
	{
		monsterID: Monsters.MountainTroll.id,
		efficientName: Monsters.IceTroll.name,
		efficientMonster: Monsters.IceTroll.id,
		efficientMethod: 'cannon',
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
		efficientMethod: 'none'
	},
	{
		monsterID: Monsters.DustDevil.id,
		efficientName: Monsters.DustDevil.name,
		efficientMonster: Monsters.DustDevil.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.Dagannoth.id,
		efficientName: Monsters.Dagannoth.name,
		efficientMonster: Monsters.Dagannoth.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Hellhound.id,
		efficientName: Monsters.Hellhound.name,
		efficientMonster: Monsters.Hellhound.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.ElfWarrior.id,
		efficientName: Monsters.ElfWarrior.name,
		efficientMonster: Monsters.ElfWarrior.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Drake.id,
		efficientName: Monsters.Drake.name,
		efficientMonster: Monsters.Drake.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Suqah.id,
		efficientName: Monsters.Suqah.name,
		efficientMonster: Monsters.Suqah.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.BlackDemon.id,
		efficientName: Monsters.BlackDemon.name,
		efficientMonster: Monsters.BlackDemon.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.GreaterDemon.id,
		efficientName: Monsters.GreaterDemon.name,
		efficientMonster: Monsters.GreaterDemon.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.SmokeDevil.id,
		efficientName: Monsters.SmokeDevil.name,
		efficientMonster: Monsters.SmokeDevil.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.DarkBeast.id,
		efficientName: Monsters.DarkBeast.name,
		efficientMonster: Monsters.DarkBeast.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.SteelDragon.id,
		efficientName: Monsters.SteelDragon.name,
		efficientMonster: Monsters.SteelDragon.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.CaveHorror.id,
		efficientName: Monsters.CaveHorror.name,
		efficientMonster: Monsters.CaveHorror.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Ankou.id,
		efficientName: Monsters.Ankou.name,
		efficientMonster: Monsters.Ankou.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.BlueDragon.id,
		efficientName: Monsters.BabyBlueDragon.name,
		efficientMonster: Monsters.BabyBlueDragon.id,
		efficientMethod: 'none'
	},
	{
		monsterID: Monsters.FireGiant.id,
		efficientName: Monsters.FireGiant.name,
		efficientMonster: Monsters.FireGiant.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Hydra.id,
		efficientName: Monsters.Hydra.name,
		efficientMonster: Monsters.Hydra.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.AbyssalDemon.id,
		efficientName: Monsters.AbyssalDemon.name,
		efficientMonster: Monsters.AbyssalDemon.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.Lizardman.id,
		efficientName: Monsters.Lizardman.name,
		efficientMonster: Monsters.Lizardman.id,
		efficientMethod: 'cannon'
	}
];

function determineAutoslayMethod(autoslayOptions: AutoslayOptionsEnum[]) {
	let method = 'default';
	if (autoslayOptions.includes(AutoslayOptionsEnum.MaxEfficiency)) {
		method = 'ehp';
	} else if (autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) {
		method = 'boss';
	} else if (autoslayOptions.includes(AutoslayOptionsEnum.LowestCombat)) {
		method = 'low';
	}
	return method;
}

export async function autoSlayCommand({
	mahojiUser,
	channelID,
	modeOverride,
	saveMode,
	interaction
}: {
	mahojiUser: MUser;
	channelID: string;
	modeOverride?: string;
	saveMode?: boolean;
	interaction: ChatInputCommandInteraction;
}) {
	const user = await mUserFetch(mahojiUser.id);
	const autoslayOptions = user.user.slayer_autoslay_options;
	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask = usersTask.assignedTask !== null && usersTask.currentTask !== null;

	if (!isOnTask) {
		return slayerNewTaskCommand({ userID: user.id, channelID, interaction });
	}
	const savedMethod = determineAutoslayMethod(autoslayOptions as AutoslayOptionsEnum[]);
	const method = modeOverride ?? savedMethod;

	if (modeOverride && saveMode) {
		const autoslayIdToSave = autoslayModes.find(
			asm =>
				stringMatches(modeOverride, asm.name) || asm.aliases.some(alias => stringMatches(modeOverride, alias))
		);
		if (autoslayIdToSave) {
			await user.update({ slayer_autoslay_options: [autoslayIdToSave.key] });
		}
	}
	const channel = globalClient.channels.cache.get(channelID.toString());
	const cmdRunOptions = {
		channelID,
		guildID: isGuildChannel(channel) ? channel.guild.id : undefined,
		user,
		member: null,
		interaction
	};

	if (method === 'low') {
		let currentLow = Number.POSITIVE_INFINITY;
		let currentMonID: number | null = null;

		for (const monsterID of usersTask.assignedTask!.monsters) {
			const osjsM = Monsters.get(monsterID);
			if (osjsM && osjsM.data.combatLevel < currentLow) {
				currentLow = osjsM.data.combatLevel;
				currentMonID = monsterID;
			}
		}

		if (currentMonID === null) throw new Error('Could not get Monster data to find a task.');

		runCommand({
			commandName: 'k',
			args: {
				name: Monsters.get(currentMonID)!.name
			},
			bypassInhibitors: true,
			...cmdRunOptions
		});
		return;
	}
	if (method === 'ehp') {
		const ehpMonster = AutoSlayMaxEfficiencyTable.find(e => {
			const masterMatch = !e.slayerMasters || e.slayerMasters.includes(usersTask.currentTask!.slayer_master_id);
			return masterMatch && e.monsterID === usersTask.assignedTask!.monster.id;
		});

		const ehpKillable = killableMonsters.find(m => m.id === ehpMonster?.efficientMonster);

		// If we don't have the requirements for the efficient monster, revert to default monster
		if (ehpKillable?.levelRequirements !== undefined && !hasSkillReqs(user, ehpKillable.levelRequirements)[0]) {
			runCommand({
				commandName: 'k',
				args: {
					name: usersTask.assignedTask!.monster.name
				},
				bypassInhibitors: true,
				...cmdRunOptions
			});
			return;
		}

		if (ehpMonster && ehpMonster.efficientName) {
			runCommand({
				commandName: 'k',
				args: {
					name: ehpMonster.efficientName,
					method: ehpMonster.efficientMethod
				},
				bypassInhibitors: true,
				...cmdRunOptions
			});
			return;
		}
		runCommand({
			commandName: 'k',
			args: {
				name: usersTask.assignedTask!.monster.name
			},
			bypassInhibitors: true,
			...cmdRunOptions
		});
		return;
	}
	if (method === 'boss') {
		// This code handles the 'highest/boss' setting of autoslay.
		const myQPs = await user.QP;
		let commonName = getCommonTaskName(usersTask.assignedTask!.monster);
		if (commonName === 'TzHaar') {
			runCommand({
				commandName: 'activities',
				args: { fight_caves: {} },
				bypassInhibitors: true,
				...cmdRunOptions
			});
			return;
		}

		const allMonsters = killableMonsters.filter(m => {
			return usersTask.assignedTask!.monsters.includes(m.id);
		});
		if (allMonsters.length === 0) return 'Please report this error. No monster variations found.';
		let maxDiff = 0;
		let maxMobName: string | null = null;

		for (const m of allMonsters) {
			if (
				(m.difficultyRating ?? 0) > maxDiff &&
				(m.levelRequirements === undefined || hasSkillReqs(user, m.levelRequirements))
			) {
				if (m.qpRequired === undefined || m.qpRequired <= myQPs) {
					maxDiff = m.difficultyRating ?? 0;
					maxMobName = m.name;
				}
			}
		}

		if (maxMobName) {
			runCommand({
				commandName: 'k',
				args: { name: maxMobName },
				bypassInhibitors: true,
				...cmdRunOptions
			});
			return;
		}
		interaction.reply({ content: "Can't find any monsters you have the requirements to kill!", ephemeral: true });
		return;
	}
	await runCommand({
		commandName: 'k',
		args: { name: usersTask.assignedTask!.monster.name },
		bypassInhibitors: true,
		...cmdRunOptions
	});
}
