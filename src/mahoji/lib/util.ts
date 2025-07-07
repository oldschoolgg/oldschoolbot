import type { ICommand, MahojiClient } from '@oldschoolgg/toolkit/discord-util';

import { Cooldowns } from './Cooldowns';
import type { AbstractCommand, AbstractCommandAttributes } from './inhibitors';

export interface OSBMahojiCommand extends ICommand {
	attributes?: Omit<AbstractCommandAttributes, 'description'>;
}

export function convertMahojiCommandToAbstractCommand(command: OSBMahojiCommand): AbstractCommand {
	return {
		name: command.name,
		attributes: { ...command.attributes, description: command.description }
	};
}

export function allAbstractCommands(mahojiClient: MahojiClient): AbstractCommand[] {
	return Array.from(mahojiClient.commands.values()).map(convertMahojiCommandToAbstractCommand);
}

export function resetCooldown(user: MUser, key?: string) {
	return Cooldowns.delete(user.id, key);
}
