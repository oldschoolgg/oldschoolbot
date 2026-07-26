import { blacklistCommand } from '@/commands/blacklist.js';
import { linkCommand } from '@/commands/link.js';
import { perksCommand } from '@/commands/perksCommand.js';
import { pingableRolesCommand } from '@/commands/pingableroles.js';
import { reactCommand } from '@/commands/react.js';
import { tagCommand } from '@/commands/tag.js';
import { toolsCommand } from '@/commands/tools.js';
import { triviaCommand } from '@/commands/trivia.js';

export const allCommands: AnyCommand[] = [
	blacklistCommand,
	pingableRolesCommand,
	reactCommand,
	tagCommand,
	perksCommand,
	toolsCommand,
	triviaCommand,
	linkCommand
];
