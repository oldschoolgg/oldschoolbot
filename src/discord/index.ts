import { defineCommand } from './commands/commandTypes.js';

export * from './commands/index.js';
export * from './presetCommandOptions.js';
export { bulkUpdateCommands } from './utils.js';

declare global {
	var defineCommand: typeof import('./commands/commandTypes.js').defineCommand;
}

global.defineCommand = defineCommand;
