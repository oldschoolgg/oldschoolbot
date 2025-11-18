export * from './commands/index.js';
export * from './presetCommandOptions.js';
export { bulkUpdateCommands } from './utils.js';

import { defineCommand as defineCommandSrc } from './commands/commandTypes.js';

declare global {
	var defineCommand: typeof defineCommandSrc;
}

global.defineCommand = defineCommandSrc;
