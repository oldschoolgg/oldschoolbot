import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { SkillsEnum } from '../../lib/skilling/types';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Pickpocket from '../../lib/skilling/skills/thieving/pickpocketing';
import { stringMatches } from '../../lib/util';

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' '
		});
	}

@minionNotBusy
@requiresMinion
async run(msg: KlasaMessage, [name = '']: [string]) {
	const NPC = Pickpocket.NPC.find(
		NPC => stringMatches(NPC.name, name)
	);

	if(!NPC) {
		throw `Thats not a valid NPC to pickpocket.` //need to figure out how to create map
	}

	const userLvl = msg.author.skillLevel(SkillsEnum.Thieving);

	if(userLvl < NPC.level) {
		throw `You are not a high enough level to pickpocket this NPC.`
	}

}
}