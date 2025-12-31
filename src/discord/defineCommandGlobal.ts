import { defineCommand as defineCommandSrc } from './commands/commandTypes.js';

declare global {
	var defineCommand: typeof defineCommandSrc;
}

global.defineCommand ??= defineCommandSrc;

export {};
