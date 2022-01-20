import { BotCommand } from '../../lib/structures/BotCommand';
import { AbstractCommand } from './inhibitors';

export function convertKlasaCommandToAbstractCommand(command: BotCommand): AbstractCommand {
	return {
		name: command.name,
		attributes: {
			altProtection: command.altProtection,
			oneAtTime: command.oneAtTime,
			guildOnly: command.guildOnly,
			perkTier: command.perkTier,
			ironCantUse: command.ironCantUse,
			examples: command.examples,
			categoryFlags: command.categoryFlags,
			bitfieldsRequired: command.bitfieldsRequired,
			enabled: command.enabled,
			testingCommand: command.testingCommand,
			cooldown: command.cooldown,
			requiredPermissionsForBot: command.requiredPermissionsForBot,
			requiredPermissionsForUser: command.requiredPermissionsForUser,
			runIn: command.runIn
		}
	};
}
