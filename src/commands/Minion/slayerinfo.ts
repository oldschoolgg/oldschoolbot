import { CommandStore, KlasaMessage } from 'klasa';
import slayerMasters from '../../lib/skilling/skills/slayer/slayerMasters';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 1,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		if (!msg.author.hasMinion) {
			throw `You don't have a minion yet. You can buy one by typing \`${msg.cmdPrefix}minion buy\`.`;
		}
		const { settings } = msg.author;
		const slayerInfo = settings.get(UserSettings.Slayer.SlayerInfo);
        const extendList = settings.get(UserSettings.Slayer.ExtendList);
        const blockList = settings.get(UserSettings.Slayer.BlockList)
        const unlockList = settings.get(UserSettings.Slayer.UnlockedList)

		// Figure out what master they're using
        const master = slayerMasters.find(master => master.masterId === slayerInfo.currentMaster);
        let str = `SLAYERINFO:`;
        if (slayerInfo.hasTask) {
            if (!slayerInfo.currentTask) throw `WTF`;
            str += `\nYou got a slayer task of ${slayerInfo.quantityTask} x ${slayerInfo.currentTask.name} from ${master?.name}, remaining to slay is ${slayerInfo.remainingQuantity}.\nIf you like to cancel a task do \`${msg.cmdPrefix}slayertask cancel\` or visit Turael for a easier task.`;
            if (slayerInfo.currentTask?.alternatives) {
                str += `\nYou can also kill these monsters: ${slayerInfo.currentTask?.alternatives}!`;
                const re = /\,/gi;
                str.replace(re, `, `);
            }
        }
        else {
            str += `\nYou don't got a slayer task, visit a slayer master.`;
        }
        str += `\nYour current Slayer Points balance is: ${slayerInfo.slayerPoints}.`
        str += `\nYour current normal slayer streak is ${slayerInfo.streak} and wildy slayer streak is ${slayerInfo.wildyStreak}.`

        str += '\nYour current block list: ';
        if (blockList.length === 0) {
            str += `You don't have any blocked tasks yet`;
        }
        for (let i = 0; i < blockList.length; i++) {
            const blockedName = blockList[i].name;
            str += `${blockedName}, `;
        }

        str += '\nYour current extension list: ';
        if (extendList.length === 0) {
            str += `is empty.`;
        }
        else {
            for (let i = 0; i < extendList.length; i++) {
                const extendName = extendList[i].name;
                str += `${extendName}, `;
            }
        }
        str += '\nYour current unlock list: ';
        if (unlockList.length === 0) {
            str += `is empty.`;
        }
        for (let i = 0; i < unlockList.length; i++) {
            const unlockedName = unlockList[i].name;
            str += `${unlockedName}, `;
        }
        
        return msg.send(str);
    }
}
