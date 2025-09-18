import type { ICommand, MahojiClient } from './Mahoji.js';

export type CategoryFlag =
	| 'minion'
	| 'settings'
	| 'patron'
	| 'skilling'
	| 'pvm'
	| 'minigame'
	| 'utility'
	| 'fun'
	| 'simulation';

export interface AbstractCommandAttributes {
	examples?: string[];
	categoryFlags?: CategoryFlag[];
	enabled?: boolean;
	cooldown?: number;
	requiresMinionNotBusy?: boolean;
	requiresMinion?: boolean;
	description: string;
}

export interface AbstractCommand {
	name: string;
	attributes?: AbstractCommandAttributes;
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

declare global {
	interface OSBMahojiCommand extends ICommand {
		attributes?: Omit<AbstractCommandAttributes, 'description'>;
	}
}
